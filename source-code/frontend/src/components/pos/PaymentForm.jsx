import { loadAllAccount } from "@/redux/rtk/features/account/accountSlice";
import { Button, DatePicker, Form, Input, Modal } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addSale } from "../../redux/rtk/features/sale/saleSlice";
import { loadAllTermsAndConditions } from "../../redux/rtk/features/termsAndCondition/termsAndConditionSlice";
import Payments from "./Payments";

export default function PaymentForm({
  isModalOpen,
  setIsModalOpen,
  form,
  totalTaxAmount,
  total,
  totalPayable,
  totalDiscount,
  totalCalculator,
  due,
  productForm,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedTermsAndConditions, setSelectedTermsAndConditions] =
    useState("");

  const { list: termsAndConditions, loading } = useSelector(
    (state) => state.termsAndConditions
  );

  // Get user ID from local storage
  const userId = localStorage.getItem("id");

  const onFormSubmit = async (values) => {
    try {
      const products = productForm
        ?.getFieldValue("saleInvoiceProduct")
        ?.map((product) => {
          const quantity = product?.productQuantity || 0;
          const price = product?.productSalePrice || 0;
          const data = {
            productId: product.productId,
            productQuantity: product.productQuantity,
            productUnitSalePrice: product.productSalePrice,
            tax: product.productVat,
          };
          data.productDiscount = product.productDiscount;
          if (product.discountType === "percentage") {
            data.productDiscount =
              (price * quantity * product?.productDiscount) / 100;
          }
          return data;
        });

      const data = {
        ...values,
        customerId: productForm.getFieldValue("customerId"),
        date: productForm.getFieldValue("date"),
        paidAmount: values.paidAmount || [],
        saleInvoiceProduct: products,
        userId: parseInt(userId),
      };

      const resp = await dispatch(addSale(data));

      if (resp.payload.message === "success") {
        form.resetFields();
        navigate(`/admin/sale/${resp.payload?.data?.id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    dispatch(loadAllTermsAndConditions());
    dispatch(loadAllAccount());
  }, [dispatch]);

  // Auto-load latest terms and conditions from database
  useEffect(() => {
    if (termsAndConditions && termsAndConditions.length > 0) {
      const latestTerm = termsAndConditions[termsAndConditions.length - 1];
      setSelectedTermsAndConditions(latestTerm.subject);
      form.setFieldValue("termsAndConditions", latestTerm.subject);
    }
  }, [termsAndConditions, form]);

  return (
    <>
      <Modal
        title='Sale'
        open={isModalOpen}
        footer={false}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form
          form={form}
          className='m-lg-1'
          onFinish={onFormSubmit}
          name='dynamic_form_nest_item'
          initialValues={{
            discount: 0,
            paidAmount: 0,
            vatId: [],
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          layout='vertical'
          size='large'
          autoComplete='off'
        >
          <Form.Item className='mb-0' label='Due Date' name='dueDate'>
            <DatePicker className='' size={"small"} placeholder='Due Date' />
          </Form.Item>

          <Form.Item
            className='mb-0'
            label='Terms and Conditions'
            name='termsAndConditions'
            rules={[
              { required: true, message: "Please enter terms and conditions" },
            ]}
          >
            <Input.TextArea
              rows={4}
              loading={loading ? 1 : 0}
              placeholder='Enter terms and conditions'
              value={selectedTermsAndConditions}
              onChange={(e) =>
                setSelectedTermsAndConditions(e.target.value)
              }
            />
          </Form.Item>

          <div className='flex justify-between py-2'>
            <strong>Total amount: </strong>
            <strong>{total.toFixed(2)}</strong>
          </div>
          <div className='flex justify-between py-2'>
            <span>Total discount: </span>
            <span>{Number(totalDiscount).toFixed(2)}</span>
          </div>
          <div className='flex justify-between py-2'>
            <span>Total tax amount: </span>
            <span>{totalTaxAmount.toFixed(2)}</span>
          </div>
          <div className='flex justify-between py-2'>
            <strong>Total payable: </strong>
            <strong>{totalPayable.toFixed(2)}</strong>
          </div>
          <div className='flex justify-between py-2'>
            <strong>Due: </strong>
            <strong>{due.toFixed(2)}</strong>
          </div>
          <div className='flex justify-between py-2'>
            <span>Paid Amount: </span>
            <Payments totalCalculator={totalCalculator} />
          </div>

          <div className='flex items-center gap-3'>
            <Form.Item className='w-full mb-0'>
              <Button block type='primary' htmlType='submit'>
                Sale Now
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
}
