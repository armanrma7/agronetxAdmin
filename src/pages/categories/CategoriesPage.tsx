import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs } from "antd";
import { DataTable, DataTableColumn } from "../../components/table/DataTable";
import { apiClient } from "../../api/client";

interface Category {
  id: string;
  name_am: string;
  name_en?: string;
  name_ru?: string;
  key?: string;
  type?: string;
}

interface Subcategory {
  id: string;
  name_am: string;
  name_en?: string;
  name_ru?: string;
  key?: string;
  category_id?: string;
}

interface MeasurementLabel {
  en?: string;
  hy?: string;
  ru?: string;
}

interface Item {
  id: string;
  name_am: string;
  name_en?: string;
  name_ru?: string;
  key?: string;
  measurements?: MeasurementLabel[];
  rent_measurements?: MeasurementLabel[] | null;
  subcategory?: {
    id: string;
    name_am?: string;
    category_id?: string;
  };
  subcategory_id?: string;
  category_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const CategoriesPage = () => {
  const [pageCat, setPageCat] = useState(1);
  const [sizeCat, setSizeCat] = useState(20);
  const [pageSub, setPageSub] = useState(1);
  const [sizeSub, setSizeSub] = useState(20);
  const [pageItem, setPageItem] = useState(1);
  const [sizeItem, setSizeItem] = useState(20);

  const { data: categories, isLoading: loadingCats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get<Category[]>("/catalog/categories");
      const items = Array.isArray(res.data) ? res.data : [];
      return { items, total: items.length };
    }
  });

  const { data: subcategories, isLoading: loadingSubs } = useQuery({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const res = await apiClient.get<Subcategory[]>("/catalog/subcategories");
      const items = Array.isArray(res.data) ? res.data : [];
      return { items, total: items.length };
    }
  });

  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const res = await apiClient.get<Item[]>("/catalog/items");
      const data = Array.isArray(res.data) ? res.data : [];
      return { items: data, total: data.length };
    }
  });

  const catColumns: DataTableColumn<Category>[] = [
    { key: "name_am", title: "Category (AM)" },
    { key: "name_en", title: "Category (EN)" },
    { key: "name_ru", title: "Category (RU)" },
    { key: "type", title: "Type" },
    { key: "key", title: "Key" }
  ];

  const subColumns: DataTableColumn<Subcategory>[] = [
    { key: "name_am", title: "Subcategory (AM)" },
    { key: "name_en", title: "Subcategory (EN)" },
    { key: "name_ru", title: "Subcategory (RU)" },
    { key: "key", title: "Key" },
    { key: "category_id", title: "Category ID" }
  ];

  const itemColumns: DataTableColumn<Item>[] = [
    { key: "name_am", title: "Item (AM)" },
    { key: "name_en", title: "Item (EN)" },
    { key: "name_ru", title: "Item (RU)" },
    {
      key: "subcategory",
      title: "Subcategory",
      render: (_, row) => row.subcategory?.name_am ?? "-"
    },
    { key: "subcategory_id", title: "Subcategory ID" },
    { key: "key", title: "Key" },
    {
      key: "measurements",
      title: "Measurements",
      render: (_, row) =>
        row.measurements && row.measurements.length
          ? row.measurements
              .map((m) => m.hy || m.en || m.ru)
              .filter(Boolean)
              .join(", ")
          : "-"
    },
    {
      key: "created_at",
      title: "Created At"
    },
    {
      key: "updated_at",
      title: "Updated At"
    }
  ];

  return (
    <Tabs
      items={[
        {
          key: "categories",
          label: "Categories",
          children: (
            <DataTable<Category>
              columns={catColumns}
              data={categories?.items}
              loading={loadingCats}
              total={categories?.total}
              page={pageCat}
              pageSize={sizeCat}
              onPageChange={(p, ps) => {
                setPageCat(p);
                setSizeCat(ps);
              }}
              rowKey={(row) => row.id}
              toolbarTitle="Categories"
              searchValue=""
              onSearchChange={() => {}}
            />
          )
        },
        {
          key: "subcategories",
          label: "Subcategories",
          children: (
            <DataTable<Subcategory>
              columns={subColumns}
              data={subcategories?.items}
              loading={loadingSubs}
              total={subcategories?.total}
              page={pageSub}
              pageSize={sizeSub}
              onPageChange={(p, ps) => {
                setPageSub(p);
                setSizeSub(ps);
              }}
              rowKey={(row) => row.id}
              toolbarTitle="Subcategories"
              searchValue=""
              onSearchChange={() => {}}
            />
          )
        },
        {
          key: "items",
          label: "Items",
          children: (
            <DataTable<Item>
              columns={itemColumns}
              data={items?.items}
              loading={loadingItems}
              total={items?.total}
              page={pageItem}
              pageSize={sizeItem}
              onPageChange={(p, ps) => {
                setPageItem(p);
                setSizeItem(ps);
              }}
              rowKey={(row) => row.id}
              toolbarTitle="Items"
              searchValue=""
              onSearchChange={() => {}}
            />
          )
        }
      ]}
    />
  );
};

