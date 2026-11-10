import { CakeSettingsRepository } from "@/features/repository/CakeSettings/CakeSettings.repository";
import { settingSchema } from "./setting.schema";
import { setActiveAcademicYearCache } from "@/shared/middleware/database-selector";

export namespace CakeSettingsService {
  export const getSettings = async () => {
    const settings = await CakeSettingsRepository.getCakeSettings();
    // console.log(`[${Date.now()}] CakeSettingsService.getSettings: Returned from repository:`, settings);
    return settings;
  };

  export const createSettings = async (data: typeof settingSchema.static) => {
    console.log("CakeSettingsService.createSettings: Data received:", data);
    const formattedData: any = { ...data };

    if (formattedData.pickupStartDate) {
      formattedData.pickupStartDate = new Date(formattedData.pickupStartDate);
    } else if (formattedData.pickupStartDate === "") {
      formattedData.pickupStartDate = null;
    }

    if (formattedData.pickupEndDate) {
      formattedData.pickupEndDate = new Date(formattedData.pickupEndDate);
    } else if (formattedData.pickupEndDate === "") {
      formattedData.pickupEndDate = null;
    }

    const { getAcademicYear } = await import("@/providers/database/database.context");
    const { getActiveAcademicYear } = await import("@/shared/middleware/database-selector");
    const currentActiveYear = getActiveAcademicYear();
    const currentContextYear = getAcademicYear();
    const isHistorical = Boolean(currentContextYear && currentContextYear !== currentActiveYear);

    const upsertedSettings = await CakeSettingsRepository.upsertCakeSettings(formattedData);
    if (!isHistorical && upsertedSettings?.academicYear) {
      setActiveAcademicYearCache(upsertedSettings.academicYear);
    }

    // Only sync active settings into master default DB if NOT editing a historical year
    if (!isHistorical) {
      try {
        const { getClient } = await import("@/providers/database/connection-manager");
        const defaultClient = getClient();
        const existingInDefault = await defaultClient.cakeSettings.findFirst();
        if (existingInDefault) {
          await defaultClient.cakeSettings.update({
            where: { id: existingInDefault.id },
            data: formattedData,
          });
        } else {
          await defaultClient.cakeSettings.create({
            data: formattedData,
          });
        }
      } catch (syncErr) {
        console.warn("Could not sync settings to default DB:", syncErr);
      }
    }

    // Synchronize Security Key and Maintenance Mode across ALL year databases and default database
    if (formattedData.securityKey !== undefined || formattedData.isMaintenanceMode !== undefined) {
      try {
        const { getAllDatabaseClients } = await import("@/providers/database/connection-manager");
        const allClients = await getAllDatabaseClients();
        console.log(`[CakeSettingsService] Synchronizing settings across ${allClients.length} databases...`);
        for (const client of allClients) {
          try {
            const existingSetting = await client.cakeSettings.findFirst();
            const updatePayload: any = {};
            if (formattedData.securityKey !== undefined) updatePayload.securityKey = formattedData.securityKey;
            if (formattedData.isMaintenanceMode !== undefined) updatePayload.isMaintenanceMode = formattedData.isMaintenanceMode;
            if (formattedData.maintenanceMessage !== undefined) updatePayload.maintenanceMessage = formattedData.maintenanceMessage;

            if (existingSetting) {
              await client.cakeSettings.update({
                where: { id: existingSetting.id },
                data: updatePayload,
              });
            } else {
              await client.cakeSettings.create({
                data: {
                  ...updatePayload,
                  academicYear: formattedData.academicYear,
                  currentYear: formattedData.currentYear,
                },
              });
            }
          } catch (dbErr) {
            console.error("[CakeSettingsService] Error syncing settings to a database client:", dbErr);
          }
        }
      } catch (syncAllErr) {
        console.error("[CakeSettingsService] Failed to sync settings across all databases:", syncAllErr);
      }
    }
    console.log("CakeSettingsService.createSettings: Upserted settings returned:", upsertedSettings);
    return upsertedSettings;
  };
}