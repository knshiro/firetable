import { useState } from "react";
import useTable from "./useTable";
import useTableConfig from "./useTableConfig";
import useTables from "./useTables";
import _find from "lodash/find";
export type FiretableActions = {
  // TODO: Stricter types here
  column: {
    add: Function;
    resize: (index: number, width: number) => void;
    rename: Function;
    remove: Function;
    update: Function;
    reorder: Function;
  };
  row: { add: Function; delete: Function; more: Function };
  table: {
    set: Function;
    filter: Function;
    updateConfig: Function;
    orderBy: Function;
  };
};

export type FiretableState = {
  tables: any;
  orderBy: FiretableOrderBy;
  tablePath: string;
  config: { rowHeight: number };
  columns: any[];
  rows: { [key: string]: any }[];
  queryLimit: number;
  filters: FireTableFilter[];
  loadingRows: boolean;
  loadingColumns: boolean;
};
export type FireTableFilter = {
  key: string;
  operator: "==" | "<" | ">" | ">=" | "<=" | string;
  value: string | number | boolean | string[];
};
export type FiretableOrderBy = { key: string; direction: "asc" | "desc" }[];
const useFiretable = (
  collectionName?: string,
  filters?: FireTableFilter[],
  orderBy?: FiretableOrderBy
) => {
  const [tables] = useTables();
  const [table, setTable] = useState({ columns: [], rowHeight: 30 });
  console.log(tables);
  const [tableState, tableActions] = useTable({
    path: collectionName,
    filters,
    orderBy,
  });
  /** set collection path of table */
  const setCollection = (
    collectionName: string,
    filters: FireTableFilter[]
  ) => {
    if (collectionName !== tableState.path || filters !== tableState.filters) {
      tableActions.setTable(collectionName, filters);
      const _table = _find(tables, t => t.collection === collectionName);
      console.log(_table);
      setTable(_table);
    }
  };
  const filterTable = (filters: FireTableFilter[]) => {
    tableActions.dispatch({ filters });
  };
  const setOrder = (orderBy: FiretableOrderBy) => {
    tableActions.dispatch({ orderBy });
  };
  const state: FiretableState = {
    tables,
    orderBy: tableState.orderBy,
    tablePath: tableState.path,
    filters: tableState.filters,
    columns: table.columns,
    config: { rowHeight: table.rowHeight },
    rows: tableState.rows,
    queryLimit: tableState.limit,
    loadingRows: tableState.loading,
    loadingColumns: false,
  };
  const actions: FiretableActions = {
    column: {
      // add: table.add,
      // resize: table.resize,
      // rename: table.rename,
      // update: table.updateColumn,
      // remove: table.remove,
      // reorder: table.reorder,
      add: () => {},
      resize: () => {},
      rename: () => {},
      update: () => {},
      remove: () => {},
      reorder: () => {},
    },
    row: {
      add: tableActions.addRow,
      delete: tableActions.deleteRow,
      more: tableActions.moreRows,
    },
    table: {
      updateConfig: () => {},
      //updateConfig: table.updateConfig,
      set: setCollection,
      orderBy: setOrder,
      filter: filterTable,
    },
  };

  return { tableState: state, tableActions: actions };
};

export default useFiretable;
