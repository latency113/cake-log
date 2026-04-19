import React, { useEffect } from "react";
import GeneralInfoSection from "./sections/GeneralInfoSection";
import CakeDetailsTable from "./cake-details/CakeDetailTable";
import SummarySection from "./sections/SummarySection";
import OrderFormSkeleton from "./skeletons/OrderFormSkeleton";
import OrderSummaryModal from "./summary/OrderSummaryModal";
import useOrderForm from "../../hooks/useOrderForm";
import type { Order } from "../../types"; // Import Order type
import { SaveIcon } from "lucide-react";

interface OrderFormProps {
  initialOrder?: Order | null; // Add initialOrder prop
  onOrderEdited?: () => void; // New prop
  onClose?: () => void; // New prop
  initialBookId?: string; // New prop
}

const OrderForm: React.FC<OrderFormProps> = ({
  initialOrder,
  onOrderEdited,
  onClose,
  initialBookId,
}) => {
  const isBookLocked = !!initialBookId;
  const isTeacherInfoLocked = false; // Let GeneralInfoSection handle locking based on classroom count

  const {
    formData,
    loading,
    departmentsData,
    yearsData,
    teamsData,
    classroomsData,
    grandTotal,
    netPayable,
    remainingBalance,
    handleGeneralInfoChange,
    handleCakeQuantityChange,
    handleDepositAmountChange,
    handleSubmit,
    handleConfirmSubmit,
    handleCloseSummaryModal,
    isSummaryModalOpen,
    handleCancel,
    errors,
    isCheckingNumber,
    numberError,
    handleNumberBlur,
    orderBooks,
  } = useOrderForm(initialOrder, onOrderEdited, onClose, initialBookId); // Pass initialBookId to useOrderForm

  useEffect(() => {}, [numberError, isCheckingNumber]);

  if (loading) {
    return <OrderFormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="container mx-auto space-y-6">
      {/* Header */}
      <div className="text-center border-b border-gray-100">
        <h2 className="text-xl font-bold text-foreground mb-2">
          บันทึกข้อมูลคำสั่งซื้อ
        </h2>
      </div>
      {/* Form Content Container */}
      <div className="relative overflow-hidden">
        {/* Step 1: General Information */}

        {/* Step 2: Cake Details */}
        <div className="flex gap-4">
          <GeneralInfoSection
            formData={formData}
            handleChange={handleGeneralInfoChange}
            departments={departmentsData}
            years={yearsData}
            teams={teamsData}
            orderBooks={orderBooks}
            errors={errors}
            isCheckingNumber={isCheckingNumber}
            numberError={numberError}
            handleNumberBlur={handleNumberBlur}
            isBookLocked={isBookLocked}
            isTeacherInfoLocked={isTeacherInfoLocked}
          />
          <CakeDetailsTable
            cakeItems={formData.cakeItems}
            onQuantityChange={handleCakeQuantityChange}
          />
        </div>
        <SummarySection
          grandTotal={grandTotal}
          discount={formData.discount}
          netPayable={netPayable}
          deposit={formData.deposit}
          onDepositAmountChange={handleDepositAmountChange}
        />

        <div className="flex justify-end items-center gap-3 mt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2 border rounded-sm text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isCheckingNumber || !!numberError}
            className="flex items-center gap-1.5 px-7 py-2 rounded-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SaveIcon className="w-4 h-4" />
            บันทึก
          </button>
        </div>
      </div>
      {/* Action Buttons */}

      {/* Order Summary Modal */}
      <OrderSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={handleCloseSummaryModal}
        onConfirm={handleConfirmSubmit}
        formData={formData}
        grandTotal={grandTotal}
        netPayable={netPayable}
        remainingBalance={remainingBalance}
        departmentsData={departmentsData}
        yearsData={yearsData}
        teamsData={teamsData}
        classroomsData={classroomsData}
        deposit={formData.deposit}
      />
    </form>
  );
};

export default OrderForm;
