import React, { Suspense } from "react";
import clsx from "clsx";
import { FormatterProps } from "react-data-grid";

import { makeStyles, createStyles } from "@material-ui/core";

import ErrorBoundary from "components/ErrorBoundary";
import { useFiretableContext } from "../../../contexts/firetableContext";

const useStyles = makeStyles(theme =>
  createStyles({
    "@global": {
      ".rdg-cell-mask.rdg-selected": {
        // Prevent 3px-wide cell selection border when both react-data-grid
        // cell selection mask and our custom one are active
        boxShadow: `0 0 0 1px ${theme.palette.background.paper} inset`,
      },
    },

    cellMask: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ".rdg-cell-mask.rdg-selected&": { boxShadow: "none" },
    },
  })
);

export type CustomCellProps = FormatterProps<any> & {
  value: any;
  onSubmit: (value: any) => void;
};

/**
 * HOC to wrap around custom cell formatters.
 * Displays react-data-grid’s blue selection border when the cell is selected.
 * @param Component The formatter component to display
 */
const withCustomCell = (Component: React.ComponentType<CustomCellProps>) => (
  props: FormatterProps<any>
) => {
  const classes = useStyles();
  const { updateCell, sideDrawerRef } = useFiretableContext();

  const handleSubmit = (value: any) => {
    if (updateCell)
      updateCell(props.row.ref, props.column.key as string, value);
  };

  const isSelected =
    sideDrawerRef?.current?.cell?.row === props.rowIdx &&
    sideDrawerRef?.current?.cell?.column === (props.column.key as string);

  return (
    <ErrorBoundary fullScreen={false} basic>
      <Suspense fallback={<div />}>
        {isSelected && (
          <div
            className={clsx("rdg-cell-mask rdg-selected", classes.cellMask)}
          />
        )}
        <Component
          {...props}
          value={props.row[props.column.key as string]}
          onSubmit={handleSubmit}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

export default withCustomCell;
