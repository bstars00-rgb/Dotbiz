import { describe, it, expect } from "vitest";
import { hotels } from "@/mocks/hotels";
import { getRoomsByHotel } from "@/mocks/rooms";
import { bookings } from "@/mocks/bookings";

describe("Mock Data: Hotels", () => {
  it("should have at least 20 hotels", () => {
    expect(hotels.length).toBeGreaterThanOrEqual(20);
  });

  it("should have required fields for every hotel", () => {
    hotels.forEach(h => {
      expect(h.id).toBeTruthy();
      expect(h.name).toBeTruthy();
      expect(h.brand).toBeTruthy();
      expect(h.area).toBeTruthy();
      expect(h.starRating).toBeGreaterThan(0);
      expect(h.starRating).toBeLessThanOrEqual(5);
      expect(h.reviewScore).toBeGreaterThan(0);
      expect(h.reviewScore).toBeLessThanOrEqual(10);
      expect(h.price).toBeGreaterThan(0);
      expect(typeof h.lat).toBe("number");
      expect(typeof h.lng).toBe("number");
    });
  });

  it("should have unique hotel IDs", () => {
    const ids = hotels.map(h => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should have valid coordinates (lat/lng range)", () => {
    hotels.forEach(h => {
      expect(h.lat).toBeGreaterThanOrEqual(-90);
      expect(h.lat).toBeLessThanOrEqual(90);
      expect(h.lng).toBeGreaterThanOrEqual(-180);
      expect(h.lng).toBeLessThanOrEqual(180);
    });
  });
});

describe("Mock Data: Rooms", () => {
  it("should return rooms for Peninsula Shanghai (htl-007)", () => {
    const rooms = getRoomsByHotel("htl-007");
    expect(rooms.length).toBeGreaterThan(0);
  });

  it("should have required fields for every room", () => {
    const rooms = getRoomsByHotel("htl-007");
    rooms.forEach(r => {
      expect(r.id).toBeTruthy();
      expect(r.name).toBeTruthy();
      expect(r.price).toBeGreaterThan(0);
      expect(r.bedType).toBeTruthy();
      expect(r.maxGuests).toBeGreaterThan(0);
      expect(typeof r.mealIncluded).toBe("boolean");
      expect(r.cancellationPolicy).toBeTruthy();
      expect(r.confirmType).toBeTruthy();
    });
  });

  it("should have sold-out rooms (remaining === 0)", () => {
    const rooms = getRoomsByHotel("htl-007");
    const soldOut = rooms.filter(r => r.remaining === 0);
    expect(soldOut.length).toBeGreaterThan(0);
  });

  it("should have rooms with promotionTag", () => {
    const rooms = getRoomsByHotel("htl-007");
    const withPromo = rooms.filter(r => r.promotionTag);
    expect(withPromo.length).toBeGreaterThan(0);
  });

  it("should return empty array for unknown hotel", () => {
    const rooms = getRoomsByHotel("htl-unknown");
    expect(rooms).toEqual([]);
  });
});

describe("Mock Data: Bookings", () => {
  it("should have at least 10 bookings", () => {
    expect(bookings.length).toBeGreaterThanOrEqual(10);
  });

  it("should have required fields for every booking", () => {
    bookings.forEach(b => {
      expect(b.id).toBeTruthy();
      expect(b.hotelName).toBeTruthy();
      expect(b.guestName).toBeTruthy();
      expect(b.checkIn).toBeTruthy();
      expect(b.bookingStatus).toBeTruthy();
      expect(b.sumAmount).toBeGreaterThan(0);
    });
  });

  it("should have varied booking statuses", () => {
    const statuses = new Set(bookings.map(b => b.bookingStatus));
    expect(statuses.size).toBeGreaterThanOrEqual(3);
  });

  it("should have unique booking IDs", () => {
    const ids = bookings.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
