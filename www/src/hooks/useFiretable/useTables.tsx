import React, { useState, useEffect } from "react";
import useCollection from "../useCollection";
import { useAppContext } from "../../contexts/appContext";
const useTables = () => {
  const { userRoles } = useAppContext();
  const [tablesState, tablesDispatch] = useCollection({});

  useEffect(() => {
    if (userRoles) {
      tablesDispatch({
        path: "_FIRETABLE_",
        filters: [
          { field: "roles", value: userRoles, operator: "array-contains-any" },
        ],
      });
    }
  }, [userRoles]);

  const tables = tablesState.documents;
  return [tables];
};

export default useTables;
