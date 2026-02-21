import OrderForm from '@/components/orders/order-form';

interface EditOrderPageProps {
  params: {
    id: string;
  };
}

export default function EditOrderPage({ params }: EditOrderPageProps) {
  return <OrderForm orderId={params.id} />;
}
