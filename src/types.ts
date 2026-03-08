export interface BillData {
  electricity_kwh: number | null;
  fuel_litres: number | null;
  water_m3: number | null;
  waste_kg: number | null;
  recycled_pct: number | null;
  num_employees: number | null;
  company_name: string | null;
  bill_month: string | null;
  bill_type: string | null;
  amount_myr: number | null;
}

export interface ESGMetrics {
  carbonFootprint: number; // tCO2e
  energyIntensity: number; // kWh/employee
  waterIntensity: number; // m3/employee
  wasteIntensity: number; // kg/employee
  esgScore: number; // 0-100
  bursaCompliance: number; // 0-100
}

export interface CompanyInfo {
  name: string;
  industry: string;
  employees: number;
}
