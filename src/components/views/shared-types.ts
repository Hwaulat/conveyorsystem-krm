export type Cabin = {
  serial: string;
  model: string;
  color: string;
  code: string;
  lot: string;
  area: string;
  station: string;
  status: "Processing" | "Waiting" | "Delayed";
  elapsed: string;
};
