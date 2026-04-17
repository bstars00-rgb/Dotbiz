import React from "react";

export interface VoucherProps {
  bookingId: string;
  hotelName: string;
  hotelAddress: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomType: string;
  roomCount: number;
  totalPrice: number;
  currency: string;
  confirmationType: string;
  cancellationPolicy: string;
  specialRequests?: string;
  bookerName: string;
  bookerEmail: string;
}

export function printVoucher() {
  window.print();
}

export default function PrintableVoucher(props: VoucherProps) {
  const {
    bookingId,
    hotelName,
    hotelAddress,
    guestName,
    checkIn,
    checkOut,
    nights,
    roomType,
    roomCount,
    totalPrice,
    currency,
    confirmationType,
    cancellationPolicy,
    specialRequests,
    bookerName,
    bookerEmail,
  } = props;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(totalPrice);

  return (
    <div className="print-voucher" id="printable-voucher">
      <div className="max-w-[800px] mx-auto bg-white p-8 text-gray-800 text-sm leading-relaxed">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#FF6000] pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#FF6000" }}>
              DOTBIZ
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">Hotel Booking Voucher</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Confirmation Type</p>
            <p className="font-semibold">{confirmationType}</p>
          </div>
        </div>

        {/* Booking Reference */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booking Reference</p>
          <p className="text-2xl font-bold tracking-widest" style={{ color: "#FF6000" }}>
            {bookingId}
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Hotel Information */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Hotel Information
            </h2>
            <p className="font-semibold text-base">{hotelName}</p>
            <p className="text-gray-600 text-xs mt-1">{hotelAddress}</p>
          </section>

          {/* Stay Details */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Stay Details
            </h2>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Check-in</span>
                <span className="font-medium">{checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Check-out</span>
                <span className="font-medium">{checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{nights} night{nights !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Room Type</span>
                <span className="font-medium">{roomType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rooms</span>
                <span className="font-medium">{roomCount}</span>
              </div>
            </div>
          </section>

          {/* Guest Information */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Guest Information
            </h2>
            <p className="font-medium">{guestName}</p>
          </section>

          {/* Booker Information */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Booker Information
            </h2>
            <p className="font-medium">{bookerName}</p>
            <p className="text-gray-500 text-xs">{bookerEmail}</p>
          </section>
        </div>

        {/* Price Summary */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Total Price
          </span>
          <span className="text-xl font-bold">{formattedPrice}</span>
        </div>

        {/* Cancellation Policy */}
        <section className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Cancellation Policy
          </h2>
          <p className="text-xs text-gray-600">{cancellationPolicy}</p>
        </section>

        {/* Special Requests */}
        {specialRequests && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Special Requests
            </h2>
            <p className="text-xs text-gray-600 italic">{specialRequests}</p>
          </section>
        )}

        {/* Barcode placeholder */}
        <div className="flex justify-center my-6">
          <div className="flex items-end gap-[2px] h-10">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className="bg-gray-800"
                style={{
                  width: i % 3 === 0 ? 3 : 1,
                  height: i % 5 === 0 ? 28 : 40,
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-400 border-t border-gray-200 pt-4">
          This voucher was generated by DOTBIZ Platform. Present this voucher at check-in.
        </p>
      </div>
    </div>
  );
}
