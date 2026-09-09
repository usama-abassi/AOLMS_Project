import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Textarea } from '../../../components/Textarea';
import { supabase } from '../../../main';

interface DeliverySubmission {
  id: string;
  order_id: string;
  technician_id: string;
  status: string;
  last_saved_at: string;
  submitted_at: string | null;
  edit_deadline: string | null;
  actioned: boolean;
  sub_root_cause: string | null;
  item_category: string | null;
  ont_protection: string | null;
  internal_wiring: string | null;
  actual_actioned_item: string | null;
  actual_actioned_sub_item: string | null;
  cable_type: string | null;
  cable_length: number | null;
  conduit_clearance: string | null;
  conduit_pipe: string | null;
  pvc_trunk: string | null;
  total_conduit: number | null;
  mims_sn: string | null;
  nce_sn: string | null;
  ap1_sn: string | null;
  ap2_sn: string | null;
  ap3_sn: string | null;
  ap4_sn: string | null;
  retrieved_cpe: string | null;
  remarks: string | null;
}

const DeliveryForm: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<DeliverySubmission>>({});
  const [, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isEditAllowed, setIsEditAllowed] = useState(true);

  // Fetch order details
  const fetchOrder = async () => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    if (error) throw error;
    return data;
  };

  // Fetch delivery submission
  const fetchDeliverySubmission = async () => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase
      .from('delivery_submissions')
      .select('*')
      .eq('order_id', orderId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  };

  const { data: order, isLoading: isOrderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: fetchOrder,
  });

  const { data: submission, isLoading: isSubmissionLoading } = useQuery({
    queryKey: ['deliverySubmission', orderId],
    queryFn: fetchDeliverySubmission,
  });

  useEffect(() => {
    if (order && submission) {
      setFormData(submission);
      setIsEditAllowed(
        submission.status !== 'locked' &&
        (!submission.edit_deadline || new Date(submission.edit_deadline) > new Date())
      );
    } else if (order) {
      setFormData({
        order_id: orderId,
        technician_id: '',
        status: 'draft',
        last_saved_at: new Date().toISOString(),
      });
    }
    setIsLoading(isOrderLoading || isSubmissionLoading);
  }, [order, submission, isOrderLoading, isSubmissionLoading, orderId]);

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (data: Partial<DeliverySubmission>) => {
      if (!supabase) throw new Error('Supabase client not initialized');
      if (submission) {
        const { data: updatedData, error } = await supabase
          .from('delivery_submissions')
          .update({ ...data, last_saved_at: new Date().toISOString() })
          .eq('id', submission.id)
          .select();
        if (error) throw error;
        return updatedData[0];
      } else {
        const { data: newData, error } = await supabase
          .from('delivery_submissions')
          .insert({ ...data, last_saved_at: new Date().toISOString() })
          .select();
        if (error) throw error;
        return newData[0];
      }
    },
    onSuccess: (savedData) => {
      setFormData(savedData);
      setIsDraftSaved(true);
      queryClient.invalidateQueries({ queryKey: ['deliverySubmission', orderId] });
      setTimeout(() => setIsDraftSaved(false), 3000);
    },
  });

  // Submit form mutation
  const submitFormMutation = useMutation({
    mutationFn: async (data: Partial<DeliverySubmission>) => {
      if (!supabase) throw new Error('Supabase client not initialized');
      const submissionData = {
        ...data,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        edit_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      if (submission) {
        const { data: updatedData, error } = await supabase
          .from('delivery_submissions')
          .update(submissionData)
          .eq('id', submission.id)
          .select();
        if (error) throw error;
        return updatedData[0];
      } else {
        const { data: newData, error } = await supabase
          .from('delivery_submissions')
          .insert(submissionData)
          .select();
        if (error) throw error;
        return newData[0];
      }
    },
    onSuccess: (submittedData) => {
      setFormData(submittedData);
      setIsEditAllowed(false);
      queryClient.invalidateQueries({ queryKey: ['deliverySubmission', orderId] });
      navigate('/technician/todo');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveDraft = () => {
    saveDraftMutation.mutate(formData);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    submitFormMutation.mutate(formData);
  };

  if (!order) {
    return <div className="flex justify-center items-center h-screen">Order not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Delivery Form - Order #{order.order_number}</h2>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Order Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Work Date:</strong> {new Date(order.work_date).toLocaleDateString()}</p>
            <p><strong>Exchange:</strong> {order.exchange}</p>
            <p><strong>Block:</strong> {order.block}</p>
            <p><strong>Road:</strong> {order.road}</p>
          </div>
          <div>
            <p><strong>Building:</strong> {order.building}</p>
            <p><strong>Flat:</strong> {order.flat}</p>
            <p><strong>Package:</strong> {order.package}</p>
            <p><strong>Action:</strong> {order.action}</p>
          </div>
        </div>
      </div>

      <form className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Delivery Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            label="Actioned"
            name="actioned"
            value={formData.actioned ? 'true' : 'false'}
            onChange={handleChange}
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            disabled={!isEditAllowed}
          />

          <Input
            label="Sub Root Cause"
            name="sub_root_cause"
            value={formData.sub_root_cause || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="Item Category"
            name="item_category"
            value={formData.item_category || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="ONT Protection"
            name="ont_protection"
            value={formData.ont_protection || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="Internal Wiring"
            name="internal_wiring"
            value={formData.internal_wiring || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="Actual Actioned Item"
            name="actual_actioned_item"
            value={formData.actual_actioned_item || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="Actual Actioned Sub Item"
            name="actual_actioned_sub_item"
            value={formData.actual_actioned_sub_item || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="Cable Type"
            name="cable_type"
            value={formData.cable_type || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="Cable Length"
            name="cable_length"
            type="number"
            value={formData.cable_length || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="Conduit Clearance"
            name="conduit_clearance"
            value={formData.conduit_clearance || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="Conduit Pipe"
            name="conduit_pipe"
            value={formData.conduit_pipe || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="PVC Trunk"
            name="pvc_trunk"
            value={formData.pvc_trunk || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="Total Conduit"
            name="total_conduit"
            type="number"
            value={formData.total_conduit || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="MIMS SN"
            name="mims_sn"
            value={formData.mims_sn || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="NCE SN"
            name="nce_sn"
            value={formData.nce_sn || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="AP1 SN"
            name="ap1_sn"
            value={formData.ap1_sn || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="AP2 SN"
            name="ap2_sn"
            value={formData.ap2_sn || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="AP3 SN"
            name="ap3_sn"
            value={formData.ap3_sn || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="AP4 SN"
            name="ap4_sn"
            value={formData.ap4_sn || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />

          <Input
            label="Retrieved CPE"
            name="retrieved_cpe"
            value={formData.retrieved_cpe || ''}
            onChange={handleChange}
            disabled={!isEditAllowed}
          />
        </div>

        <Textarea
          label="Remarks"
          name="remarks"
          value={formData.remarks || ''}
          onChange={handleChange}
          disabled={!isEditAllowed}
          rows={4}
        />

        <div className="mt-6 flex justify-end space-x-4">
          {isEditAllowed && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              isLoading={saveDraftMutation.isPending}
            >
              Save Draft
            </Button>
          )}
          {isDraftSaved && (
            <div className="text-green-600 flex items-center">
              Draft saved!
            </div>
          )}
          {isEditAllowed && (
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DeliveryForm;