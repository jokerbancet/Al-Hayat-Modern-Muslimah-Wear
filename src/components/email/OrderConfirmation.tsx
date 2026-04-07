import React from 'react';

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
}

export default function OrderConfirmation({ orderNumber, customerName, items, total }: OrderConfirmationProps) {
  return (
    <div style={{
      fontFamily: '"Montserrat", sans-serif',
      backgroundColor: '#FFF5F5',
      padding: '40px',
      color: '#3E2723',
      maxWidth: '600px',
      margin: '0 auto',
      border: '1px solid #DCAEAE'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '32px', margin: '0' }}>AL-HAYAT</h1>
        <p style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '10px' }}>Order Confirmation</p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', padding: '30px', borderRadius: '8px' }}>
        <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', marginBottom: '20px' }}>Thank you for your order, {customerName}.</h2>
        <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' }}>
          We're excited to let you know that your order <strong>#{orderNumber}</strong> has been received and is being prepared for shipment.
        </p>

        <div style={{ borderTop: '1px solid #F4C2C2', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '15px' }}>Order Summary</h3>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
              <span>{item.name} x {item.quantity}</span>
              <span>${item.price * item.quantity}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #F4C2C2', marginTop: '15px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <a href="#" style={{
            display: 'inline-block',
            backgroundColor: '#F4C2C2',
            color: '#3E2723',
            padding: '15px 30px',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            borderRadius: '4px'
          }}>
            Track Your Order
          </a>
        </div>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '10px', color: '#B08D8D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        <p>© 2026 AL-HAYAT. All rights reserved.</p>
        <p>You're receiving this because you made a purchase at al-hayat.com</p>
      </div>
    </div>
  );
}
