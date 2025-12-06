import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://provinces.open-api.vn/api/v2";

export type Province = {
  code: number;
  name: string;
};

export type Ward = {
  code: number;
  name: string;
  province_code: number;
};

const fetchProvinces = async (): Promise<Province[]> => {
  const res = await fetch(`${BASE_URL}/p/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch provinces (HTTP ${res.status})`);
  }
  const data = await res.json();
  return data;
};

const fetchWardsForProvince = async (
  provinceCode: number | string
): Promise<Ward[]> => {
  const codeNum = Number(provinceCode);
  const res = await fetch(`${BASE_URL}/w/?province=${codeNum}`);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch wards for province ${codeNum} (HTTP ${res.status})`
    );
  }
  const data = await res.json();

  return data;
};

export const useRegion = (selectedProvinceCode?: string | number) => {
  const code = selectedProvinceCode ? Number(selectedProvinceCode) : undefined;

  const provincesQuery = useQuery<Province[], Error>({
    queryKey: ["provinces", "v2"],
    queryFn: fetchProvinces,
  });

  const wardsQuery = useQuery<Ward[], Error>({
    queryKey: ["wards", "v2", code],
    queryFn: () => fetchWardsForProvince(code!),
    enabled: !!code,
  });

  return {
    provinces: provincesQuery.data ?? [],
    isLoadingProvinces: provincesQuery.isLoading,
    errorProvinces: provincesQuery.error,

    wards: wardsQuery.data ?? [],
    isLoadingWards: wardsQuery.isLoading,
    errorWards: wardsQuery.error,
  };
};
