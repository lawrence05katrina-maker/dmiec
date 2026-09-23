import { createFileRoute } from "@tanstack/react-router";
import { SymposiumLayout } from "@/components/SymposiumLayout";
import { useEffect, useState } from "react";
import { X, User, Phone, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/symposium/bus-timings")({ component: BusTimings });

type BusStop = {
  place: string;
  time: string;
};

type BusRoute = {
  routeNumber: string;
  driverName: string;
  driverPhone: string;
  stops: BusStop[];
};

const BUS_ROUTES: BusRoute[] = [
  {
    routeNumber: "Route 01",
    driverName: "Mr. Stalin",
    driverPhone: "9443738833",
    stops: [
      { place: "Panavilai", time: "7:05" },
      { place: "Kurumpanai", time: "7:10" },
      { place: "Kodimunai", time: "7:12" },
      { place: "Simon Colony", time: "7:15" },
      { place: "Colachel Beach Jn", time: "7:18" },
      { place: "Colachel Anna Statue", time: "7:20" },
      { place: "Reetha Puram", time: "7:25" },
      { place: "Thickanamcode", time: "7:35" },
      { place: "Elantha Vilai", time: "7:40" },
      { place: "Monday Market", time: "7:45" },
      { place: "Eraniel", time: "7:47" },
      { place: "Kandan Vilai", time: "7:50" },
      { place: "Motta Vilai", time: "7:52" },
      { place: "Peyankuzhi", time: "7:55" },
      { place: "Paraseri", time: "7:57" },
      { place: "Thottiyodu (Mahendra Showroom)", time: "8:05" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 02",
    driverName: "Mr. Jebinth",
    driverPhone: "9487651441",
    stops: [
      { place: "Mela Soorankudi", time: "7:45" },
      { place: "Kurusady", time: "7:48" },
      { place: "Holycross College", time: "7:50" },
      { place: "Punnai Nagar", time: "7:52" },
      { place: "M L Hospital", time: "7:55" },
      { place: "Carmel School", time: "7:58" },
      { place: "Ramanputhur", time: "8:00" },
      { place: "Chettikulam", time: "8:05" },
      { place: "Anna Bus Stand", time: "8:10" },
      { place: "Meenakshi Puram", time: "8:12" },
      { place: "Fire Station", time: "8:15" },
      { place: "Thiraviam Hospital", time: "8:20" },
      { place: "Therekal Puthur 01", time: "8:28" },
      { place: "Therekal Puthur 02", time: "8:30" },
      { place: "Vellamadam", time: "8:35" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 03",
    driverName: "Mr. Muthukrishnan",
    driverPhone: "7708387438",
    stops: [
      { place: "Thalapathi Samuthiram", time: "8:00" },
      { place: "Anna Nagar", time: "8:05" },
      { place: "Valliyur", time: "8:10" },
      { place: "South Valliyur", time: "8:15" },
      { place: "Kalanthapanai", time: "8:18" },
      { place: "Pampan Kulam", time: "8:20" },
      { place: "Lebbai Kudiyiruppu", time: "8:30" },
      { place: "Kaval Kinaru", time: "8:35" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 04",
    driverName: "Mr. Rajkumar",
    driverPhone: "880781870",
    stops: [
      { place: "Rajakkamangalam Thurai", time: "7:25" },
      { place: "Periyacadu", time: "7:28" },
      { place: "Ehamozhi", time: "7:30" },
      { place: "Semponkarai", time: "7:35" },
      { place: "Kesavan Puthen Thurai", time: "7:40" },
      { place: "Puthur", time: "7:45" },
      { place: "Pottal Jn", time: "7:50" },
      { place: "Vattakarai Bridge", time: "7:55" },
      { place: "Maravan Kudiyiruppu", time: "7:57" },
      { place: "Beach Road Jn", time: "8:00" },
      { place: "Vaithiyanathapuram", time: "8:05" },
      { place: "Suchindrum", time: "8:10" },
      { place: "Vazhukamparai", time: "8:13" },
      { place: "Mailaudy", time: "8:15" },
      { place: "Marungoor", time: "8:20" },
      { place: "Thoppur", time: "8:23" },
      { place: "Rajavoor", time: "8:25" },
      { place: "Thovalai (Main)", time: "8:35" },
      { place: "Muthu Nagar", time: "8:37" },
      { place: "Perumal Puram", time: "8:38" },
      { place: "Subash Nagar", time: "8:42" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 05",
    driverName: "Mr. Alwar",
    driverPhone: "9025518482",
    stops: [
      { place: "Manjan Kulam", time: "7:00" },
      { place: "Puthur", time: "7:10" },
      { place: "J J Nagar", time: "7:15" },
      { place: "Kalakadu", time: "7:20" },
      { place: "N Salai Puthur", time: "7:25" },
      { place: "S Salai Puthur", time: "7:30" },
      { place: "Donavoor", time: "7:40" },
      { place: "Eruvadi", time: "7:45" },
      { place: "Thirukurungudi", time: "7:55" },
      { place: "Rosmiya Puram", time: "8:15" },
      { place: "Tharmalinga Puram", time: "8:20" },
      { place: "Thalavai Puram", time: "8:25" },
      { place: "Panagudi", time: "8:30" },
      { place: "Punniyavalan Puram", time: "8:35" },
      { place: "Kaval Kinaru Jn.", time: "8:40" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 06",
    driverName: "Mr. Ajith",
    driverPhone: "9488721705",
    stops: [
      { place: "Manavalakurichi", time: "7:10" },
      { place: "Kadiaya Pattanam", time: "7:15" },
      { place: "Muttom", time: "7:20" },
      { place: "Ammandi Vilai", time: "7:23" },
      { place: "Friday Market", time: "7:26" },
      { place: "Sethuvoor", time: "7:30" },
      { place: "Kurunthencode", time: "7:33" },
      { place: "Senapalli", time: "7:35" },
      { place: "Saral", time: "7:40" },
      { place: "Asaripallam", time: "7:55" },
      { place: "Ananthanpalam", time: "8:00" },
      { place: "Christhu Nagar", time: "8:10" },
      { place: "Vetturnimadam", time: "8:15" },
      { place: "Vasan Eye care", time: "8:20" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 07",
    driverName: "Mr. Yesumani",
    driverPhone: "8903180829",
    stops: [
      { place: "Veerapuli", time: "7:40" },
      { place: "Thadikarankonam", time: "7:45" },
      { place: "Ettamadai", time: "7:50" },
      { place: "Azhagiyapandi Puram", time: "7:55" },
      { place: "Arumanallur", time: "8:00" },
      { place: "Thittuvilai", time: "8:05" },
      { place: "Thuvarancadu", time: "8:10" },
      { place: "Boothapandi", time: "8:12" },
      { place: "Andithoppu", time: "8:13" },
      { place: "Seethapal", time: "8:15" },
      { place: "Senbagaraman Puthur", time: "8:20" },
      { place: "Mathavalayam", time: "8:25" },
      { place: "Christhu Nagar", time: "8:30" },
      { place: "Kumaran Puthur", time: "8:32" },
      { place: "Thovalai (Near Channel)", time: "8:35" },
      { place: "Aralvaimozhi (Near MGR Statue)", time: "8:40" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 09",
    driverName: "Mr. Velu",
    driverPhone: "7904461209",
    stops: [
      { place: "Soundarapandipuram", time: "6:50" },
      { place: "Samathuvapuram", time: "7:00" },
      { place: "Parameswarapuram", time: "7:15" },
      { place: "Uthayathoor", time: "7:25" },
      { place: "Ilaya Nainar Kulam", time: "7:27" },
      { place: "Rathapuram", time: "7:30" },
      { place: "Thanakkarkulam", time: "7:40" },
      { place: "Koliyankulam", time: "7:45" },
      { place: "Pallavilai", time: "7:50" },
      { place: "Manickamputhur", time: "7:53" },
      { place: "Siva Subramaniya Puram", time: "7:55" },
      { place: "Antony Nagar", time: "8:03" },
      { place: "TMB ATM", time: "8:05" },
      { place: "Vepilankulam", time: "8:15" },
      { place: "Sundavilai", time: "8:17" },
      { place: "North Perunkudi", time: "8:20" },
      { place: "South Perunkudi", time: "8:22" },
      { place: "Vadakankulam", time: "8:25" },
      { place: "Sangu Nagar", time: "8:28" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 10",
    driverName: "Mr. Hari",
    driverPhone: "6382112344",
    stops: [
      { place: "Puthukadai", time: "7:00" },
      { place: "kappikadu", time: "7:05" },
      { place: "Vettumani", time: "7:10" },
      { place: "Attur", time: "7:20" },
      { place: "Poovancode", time: "7:25" },
      { place: "Veeyanur", time: "7:30" },
      { place: "Verkilampi", time: "7:35" },
      { place: "Mekkamandapam", time: "7:40" },
      { place: "Pilankalai", time: "7:45" },
      { place: "Azhagiyamandapam", time: "7:50" },
      { place: "Manali", time: "7:52" },
      { place: "Thakalay", time: "7:55" },
      { place: "Villukuri", time: "8:00" },
      { place: "Muthu Neuro Hospital", time: "8:10" },
      { place: "Sushrusha Hospital", time: "8:12" },
      { place: "Parvathipuram", time: "8:15" },
      { place: "Kattayanvilai", time: "8:18" },
      { place: "Golden bakery", time: "8:20" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 11",
    driverName: "Mr. Ruban",
    driverPhone: "8903138445",
    stops: [
      { place: "Sanganeri", time: "7:15" },
      { place: "Kottavilai", time: "7:20" },
      { place: "Irukanthurai", time: "7:30" },
      { place: "Uralvaimozhi", time: "7:35" },
      { place: "Kilkulam", time: "7:40" },
      { place: "Marankulam", time: "7:45" },
      { place: "Chidambarapuram", time: "7:50" },
      { place: "Sanganapuram", time: "8:00" },
      { place: "Yocobpuram", time: "8:05" },
      { place: "Pillayar Kudiyiruppu", time: "8:10" },
      { place: "Concordia School", time: "8:15" },
      { place: "Azhaganeri", time: "8:20" },
      { place: "Sembikulam", time: "8:23" },
      { place: "Mathagneri", time: "8:25" },
      { place: "Avarai Kulam", time: "8:30" },
      { place: "Soundaralinga Puram", time: "8:35" },
      { place: "Puthiyamputhur", time: "8:38" },
      { place: "Madanadar Kudiyiruppu", time: "8:40" },
      { place: "Kumarapuram", time: "8:45" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 12",
    driverName: "Mr. Aravind",
    driverPhone: "9791343205",
    stops: [
      { place: "Maharajapuram", time: "7:30" },
      { place: "Santhakarai Roundana", time: "7:32" },
      { place: "Kovalam church", time: "7:40" },
      { place: "Kovalam - 02", time: "7:42" },
      { place: "Samathana Puram", time: "7:47" },
      { place: "Puthugramam", time: "7:52" },
      { place: "Kanyakumari Church road - 01", time: "7:55" },
      { place: "Kanyakumari Church road - 02", time: "7:57" },
      { place: "Vivekanadapuram", time: "8:00" },
      { place: "Ottayalvilai", time: "8:03" },
      { place: "Chinnamuttom", time: "8:05" },
      { place: "Arockiapuram", time: "8:10" },
      { place: "Anjugramam", time: "8:15" },
      { place: "Pazhavoor", time: "8:18" },
      { place: "Sivagnanapuram", time: "8:20" },
      { place: "Ambalanavapuram", time: "8:30" },
      { place: "Kalainagar", time: "8:35" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 13",
    driverName: "Mr. Velmurugan",
    driverPhone: "9360973550",
    stops: [
      { place: "Uvari", time: "6:50" },
      { place: "Athankarai Pallivasal", time: "7:05" },
      { place: "Kaduthalai", time: "7:15" },
      { place: "Kothankulam", time: "7:25" },
      { place: "Kurinchikulam", time: "7:30" },
      { place: "Idinthakarai", time: "7:35" },
      { place: "Tsunami Colony", time: "7:40" },
      { place: "Vairavi Kinaru", time: "7:47" },
      { place: "Koodankulam", time: "7:50" },
      { place: "Perumanal", time: "8:05" },
      { place: "Chettikulam", time: "8:15" },
      { place: "Kootapuli", time: "8:20" },
      { place: "Ethancadu", time: "8:22" },
      { place: "Kannankulam", time: "8:25" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 14",
    driverName: "No driver listed",
    driverPhone: "",
    stops: [
      { place: "Malaiyaninthan Kudiyiruppu", time: "7:10" },
      { place: "Naina Puthur", time: "7:12" },
      { place: "Zionpuram", time: "7:14" },
      { place: "NGO Colony", time: "7:18" },
      { place: "Irullappapuram", time: "7:20" },
      { place: "Vethanagar", time: "7:22" },
      { place: "Kadher Hospital", time: "7:24" },
      { place: "Puthen Kudiyiruppu", time: "7:25" },
      { place: "Velladichivilai", time: "7:27" },
      { place: "Parakkai", time: "7:30" },
      { place: "Thengamputhur", time: "7:35" },
      { place: "Puthalam", time: "7:38" },
      { place: "Manakudy", time: "7:42" },
      { place: "Thamaraikulam", time: "7:45" },
      { place: "Muhilan Kudiyiruppu", time: "7:50" },
      { place: "Elanthayadi Vilai", time: "7:57" },
      { place: "Thannikarai", time: "8:00" },
      { place: "Agasteeswaram", time: "8:05" },
      { place: "Kottaram", time: "8:08" },
      { place: "Osaravilai", time: "8:12" },
      { place: "Mylaudy puthur", time: "8:15" },
      { place: "Punnarkulam", time: "8:20" },
      { place: "Azhagappapuram", time: "8:22" },
      { place: "James Town", time: "8:25" },
      { place: "DMI", time: "8:50" },
    ],
  },
  {
    routeNumber: "Route 15",
    driverName: "Mr. Ramchandru",
    driverPhone: "9578517519",
    stops: [
      { place: "Krishnancoil", time: "8:10" },
      { place: "Vadasery", time: "8:15" },
      { place: "SMRV School", time: "8:17" },
      { place: "Putheri", time: "8:23" },
      { place: "Erachakulam", time: "8:25" },
      { place: "Thazhakudi", time: "8:27" },
      { place: "Santhavilai", time: "8:35" },
      { place: "Mount", time: "8:40" },
      { place: "DMI", time: "8:50" },
    ],
  },
];

function BusTimings() {
  const [selected, setSelected] = useState<BusRoute | null>(null);

  // Lock body scroll behind the modal, and close on Escape.
  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  return (
    <SymposiumLayout>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-6 sm:pb-10">
        <h1 className="text-4xl sm:text-7xl font-black uppercase tracking-tighter">Bus Timings</h1>
        <p className="text-white/50 mt-3 sm:mt-4 text-sm sm:text-base">
          Tap any route for full schedule and driver contact details.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
          {BUS_ROUTES.map((route) => (
            <RouteCard key={route.routeNumber} route={route} onClick={() => setSelected(route)} />
          ))}
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selected.routeNumber}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-2xl bg-[#111112] border-t sm:border border-white/15 p-6 sm:p-8 relative max-h-[88vh] overflow-y-auto animate-[slideUp_0.25s_ease] sm:animate-[scaleIn_0.25s_ease]"
          >
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="absolute top-4 right-4 h-8 w-8 grid place-items-center text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-[10px] uppercase tracking-widest text-[#FF0000] mb-2 pr-10">
              Bus Route
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight pr-8">{selected.routeNumber}</h2>

            <div className="mt-5 space-y-2.5 text-sm">
              <div className="flex items-center gap-3 text-white/80">
                <User className="h-4 w-4 text-[#FF0000] shrink-0" />
                <span>Driver: {selected.driverName}</span>
              </div>
              {selected.driverPhone && (
                <div className="flex items-center gap-3 text-white/80">
                  <Phone className="h-4 w-4 text-[#FF0000] shrink-0" />
                  <a href={`tel:${selected.driverPhone}`} className="hover:text-[#FF0000] transition-colors">
                    {selected.driverPhone}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Schedule</div>
              <div className="space-y-2">
                {selected.stops.map((stop, i) => (
                  <div
                    key={i}
                    className={`flex items-start justify-between gap-4 py-2.5 px-3 border-l-2 transition-colors ${
                      stop.place === "DMI"
                        ? "border-[#FF0000] bg-[#FF0000]/5"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <MapPin className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${stop.place === "DMI" ? "text-[#FF0000]" : "text-white/40"}`} />
                      <span className={`text-sm ${stop.place === "DMI" ? "text-white font-bold" : "text-white/70"}`}>
                        {stop.place}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Clock className={`h-3.5 w-3.5 ${stop.place === "DMI" ? "text-[#FF0000]" : "text-white/40"}`} />
                      <span className={`text-sm font-mono ${stop.place === "DMI" ? "text-[#FF0000] font-bold" : "text-white/60"}`}>
                        {stop.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 px-3 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs leading-relaxed">
              ℹ️ Timings are approximate. Please arrive 5-10 minutes early at your stop.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform: scale(0.95) } to { opacity:1; transform: scale(1) } }
        @keyframes slideUp { from { opacity:0; transform: translateY(40px) } to { opacity:1; transform: translateY(0) } }
      `}</style>
    </SymposiumLayout>
  );
}

function RouteCard({ route, onClick }: { route: BusRoute; onClick: () => void }) {
  const firstStop = route.stops[0];
  const lastStop = route.stops[route.stops.length - 1];
  const stopCount = route.stops.length;

  return (
    <button
      onClick={onClick}
      className="text-left bg-[#0b0b0c] p-5 sm:p-6 hover:bg-[#141415] transition-colors group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-[#FF0000] font-bold">
          {route.routeNumber}
        </span>
        <span className="text-[#FF0000] opacity-0 group-hover:opacity-100 transition-opacity text-sm">→</span>
      </div>
      <div className="font-bold uppercase tracking-tight mb-2">{route.driverName}</div>
      <div className="text-xs text-white/50 space-y-1">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{firstStop.place}</span>
          <span className="text-white/30 mx-1">→</span>
          <span className="truncate">{lastStop.place}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{firstStop.time} - {lastStop.time}</span>
          <span className="text-white/30 ml-auto">{stopCount} stops</span>
        </div>
      </div>
    </button>
  );
}
