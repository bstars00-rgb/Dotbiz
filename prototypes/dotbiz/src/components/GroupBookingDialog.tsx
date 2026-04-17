import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { hotels } from "@/mocks/hotels";
import { Upload, Users } from "lucide-react";

interface Guest {
  lastName: string;
  firstName: string;
  gender: string;
  nationality: string;
}

const MOCK_GUESTS: Guest[] = [
  { lastName: "Kim", firstName: "Jiyeon", gender: "F", nationality: "KR" },
  { lastName: "Tanaka", firstName: "Hiroshi", gender: "M", nationality: "JP" },
  { lastName: "Smith", firstName: "Emily", gender: "F", nationality: "US" },
  { lastName: "Wang", firstName: "Lei", gender: "M", nationality: "CN" },
  { lastName: "Mueller", firstName: "Anna", gender: "F", nationality: "DE" },
];

const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Executive"] as const;
const ROOM_PRICES: Record<string, number> = {
  Standard: 150,
  Deluxe: 220,
  Suite: 350,
  Executive: 450,
};

interface GroupBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GroupBookingDialog({ open, onOpenChange }: GroupBookingDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [hotelId, setHotelId] = useState(hotels[0]?.id ?? "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomType, setRoomType] = useState<string>("Standard");
  const [guests, setGuests] = useState<Guest[]>(MOCK_GUESTS);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const totalRooms = guests.length;
  const pricePerRoom = ROOM_PRICES[roomType] ?? 150;
  const nights =
    checkIn && checkOut
      ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 1;
  const estimatedTotal = totalRooms * pricePerRoom * nights;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.trim().split("\n").slice(1); // skip header
      const parsed: Guest[] = rows
        .map((r) => {
          const cols = r.split(",").map((c) => c.trim());
          return { lastName: cols[0], firstName: cols[1], gender: cols[2], nationality: cols[3] };
        })
        .filter((g) => g.lastName);
      if (parsed.length) setGuests(parsed);
    };
    reader.readAsText(file);
  }

  function handleSubmit() {
    toast.success("Group booking created!", {
      description: `${totalRooms} rooms have been reserved.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#FF6000]" />
            Create Group Booking
          </DialogTitle>
          <DialogDescription>
            Upload a guest list or use sample data to create a batch reservation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Row 1: Group name + Hotel */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Group Name</label>
              <Input placeholder="e.g. APAC Sales Q2" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Hotel</label>
              <select
                className="flex h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus:ring-2 focus:ring-[#FF6000]/30"
                value={hotelId}
                onChange={(e) => setHotelId(e.target.value)}
              >
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Dates + Room type */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Check-in</label>
              <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Check-out</label>
              <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Room Type</label>
              <select
                className="flex h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus:ring-2 focus:ring-[#FF6000]/30"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CSV Upload */}
          <div
            className="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#FF6000]/30 bg-[#FF6000]/5 p-4 text-center cursor-pointer hover:border-[#FF6000]/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-5 w-5 text-[#FF6000]" />
            <p className="text-xs text-muted-foreground">
              {fileName ? (
                <>Uploaded: <span className="font-medium text-foreground">{fileName}</span></>
              ) : (
                <>Drag & drop a <span className="font-medium">.csv</span> file or click to browse</>
              )}
            </p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Guest table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Nationality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((g, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{g.lastName}</TableCell>
                    <TableCell>{g.firstName}</TableCell>
                    <TableCell>{g.gender}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{g.nationality}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-2.5 text-sm">
            <span>
              <span className="font-medium">{totalRooms}</span> rooms &times; {nights} night{nights > 1 ? "s" : ""} &times; ${pricePerRoom}
            </span>
            <span className="text-base font-semibold text-[#FF6000]">
              ${estimatedTotal.toLocaleString()}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-[#FF6000] hover:bg-[#FF6000]/90 text-white" onClick={handleSubmit}>
            Submit Group Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
