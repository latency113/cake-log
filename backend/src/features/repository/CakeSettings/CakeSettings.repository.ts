import prisma from "@/providers/database/database.provider";

export namespace CakeSettingsRepository {
    export const getCakeSettings = async () => {
        const settings = await prisma.cakeSettings.findFirst({
            orderBy: {
                updatedAt: 'desc',
            },
        });
        return settings;
    };
    export const upsertCakeSettings = async (data: any) => {
        console.log("upsertCakeSettings: Data received:", data);
        const existingSettings = await prisma.cakeSettings.findFirst();
        console.log("upsertCakeSettings: Existing settings found:", existingSettings);

        if (existingSettings) {
            // Update existing settings
            const updatedSettings = await prisma.cakeSettings.update({
                where: { id: existingSettings.id },
                data: data,
            });
            console.log("upsertCakeSettings: Updated existing settings:", updatedSettings);
            return updatedSettings;
        } else {
            // Create new settings if none exist
            const newSettings = await prisma.cakeSettings.create({
                data: data,
            });
            console.log("upsertCakeSettings: Created new settings:", newSettings);
            return newSettings;
        }
    };
}