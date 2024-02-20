import { useMemo, useState, useEffect } from "react";
import {
  type MRT_TableOptions,
  type MRT_ColumnDef,
  type MRT_Row,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Typography } from "@mui/material";
import { type Person } from "./makeData";

const Example = () => {
  const [message, setMessage] = useState("");
  // const [data1, setData1] = useState<Person[]>(() => {
  //   // Add a new property 'gamesPlayed' to each person in the data array
  //   // return data.map((person) => ({ ...person, gamesPlayed: 0 }));
  // });
  const [data1, setData1] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/message")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  const handleSaveData = () => {
    fetch("http://localhost:8000/save-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: data1 }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          console.log("Data saved successfully!");
        } else {
          console.error("Failed to save data:", result.error);
        }
      })
      .catch((error) => {
        console.error("Error saving data:", error);
      });
  };

  useEffect(() => {
    const fetchData1 = () => {
      // Fetch data1.json from the server
      fetch("http://localhost:8000/data1.json")
        .then((res) => res.json())
        .then((fetchedData1) => {
          // Update the data1 state with the fetched data
          setData1(fetchedData1);
        })
        .catch((error) => {
          console.error("Error fetching data1.json:", error);
        });
    };

    // Call the fetchData1 function when the component mounts
    fetchData1();
  }, []); // Ensure the dependency array is empty to run only once when the component mounts

  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "First Name",
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
      },
      {
        accessorKey: "city",
        header: "City",
      },
    ],
    []
  );

  const houseColumns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      ...columns,
      {
        accessorKey: "gamesPlayed",
        header: "Games Played",
        renderCell: ({ value }) => (
          <Typography variant="body2">{value}</Typography>
        ),
      },
    ],
    [columns]
  );

  const [data2, setData2] = useState<Person[]>(() => []);
  const [data3, setData3] = useState<Person[]>(() => []);

  const [draggingRow, setDraggingRow] = useState<MRT_Row<Person> | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  const commonTableProps: Partial<MRT_TableOptions<Person>> & {
    columns: MRT_ColumnDef<Person>[];
  } = {
    columns,
    enableRowDragging: true,
    enableFullScreenToggle: false,
    muiTableContainerProps: {
      sx: {
        minHeight: "320px",
      },
    },
    onDraggingRowChange: setDraggingRow,
    state: { draggingRow },
  };

  const houseTableProps = {
    ...commonTableProps,
    columns: houseColumns,
    muiRowDragHandleProps: {
      onDragEnd: () => {
        if (
          hoveredTable === "table-2" &&
          !data2.find(
            (d) =>
              d.firstName === draggingRow!.original.firstName &&
              d.lastName === draggingRow!.original.lastName
          )
        ) {
          setData2((data2) => [...data2, draggingRow!.original]);

          setData1((data1) =>
            data1.map((person) =>
              updateGamesPlayed(person, draggingRow!.original, 1)
            )
          );
        } else if (
          hoveredTable === "table-3" &&
          !data3.find(
            (d) =>
              d.firstName === draggingRow!.original.firstName &&
              d.lastName === draggingRow!.original.lastName
          )
        ) {
          setData3((data3) => [...data3, draggingRow!.original]);
          setData1((data1) =>
            data1.map((person) =>
              updateGamesPlayed(person, draggingRow!.original, 1)
            )
          );
        }
        setHoveredTable(null);
      },
    },
    muiTablePaperProps: {
      onDragEnter: () => setHoveredTable("table-1"),
      sx: {
        outline: hoveredTable === "table-1" ? "2px dashed pink" : undefined,
      },
    },
    renderTopToolbarCustomActions: () => (
      <Typography color="success.main" component="span" variant="h4">
        House 1
      </Typography>
    ),
  };

  const table1 = useMaterialReactTable({
    ...houseTableProps,
    data: data1,
    getRowId: (originalRow) => `table-1-${originalRow.firstName}`,
  });

  const table2 = useMaterialReactTable({
    ...commonTableProps,
    columns,
    data: data2,
    defaultColumn: {
      size: 100,
    },
    getRowId: (originalRow) => `table-2-${originalRow.firstName}`,
    muiRowDragHandleProps: {
      onDragEnd: () => {
        if (hoveredTable === "table-1") {
          // setData1((data1) => [...data1]);

          setData1((data1) =>
            data1.map((person) =>
              updateGamesPlayed(person, draggingRow!.original, -1)
            )
          );
          setData2((data2) => data2.filter((d) => d !== draggingRow!.original));
        }
        setHoveredTable(null);
      },
    },
    muiTablePaperProps: {
      onDragEnter: () => setHoveredTable("table-2"),
      sx: {
        outline: hoveredTable === "table-2" ? "2px dashed pink" : undefined,
      },
    },
    renderTopToolbarCustomActions: () => (
      <Typography color="error.main" component="span" variant="h4">
        Cricket
      </Typography>
    ),
  });

  const table3 = useMaterialReactTable({
    ...commonTableProps,
    columns,
    data: data3,
    defaultColumn: {
      size: 100,
    },
    getRowId: (originalRow) => `table-3-${originalRow.firstName}`,
    muiRowDragHandleProps: {
      onDragEnd: () => {
        if (hoveredTable === "table-1") {
          // setData1((data1) => [...data1]);
          setData1((data1) =>
            data1.map((person) =>
              updateGamesPlayed(person, draggingRow!.original, -1)
            )
          );

          setData3((data3) => data3.filter((d) => d !== draggingRow!.original));
        }
        setHoveredTable(null);
      },
    },
    muiTablePaperProps: {
      onDragEnter: () => setHoveredTable("table-3"),
      sx: {
        outline: hoveredTable === "table-3" ? "2px dashed pink" : undefined,
      },
    },
    renderTopToolbarCustomActions: () => (
      <Typography color="error.main" component="span" variant="h4">
        Football
      </Typography>
    ),
  });

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "auto", lg: "1fr 1fr" },
        gap: "1rem",
        overflow: "auto",
        p: "4px",
      }}
    >
      <MaterialReactTable table={table1} />
      <MaterialReactTable table={table2} />
      <MaterialReactTable table={table3} />
      <button onClick={handleSaveData}>Save Data to Server</button>
    </Box>
  );
};

// Helper function to update the gamesPlayed property when a player is moved to another table
const updateGamesPlayed = (
  person: Person,
  draggedPerson: Person,
  adjustment: number
): Person => {
  if (
    person.firstName === draggedPerson.firstName &&
    person.lastName === draggedPerson.lastName
  ) {
    return { ...person, gamesPlayed: person.gamesPlayed + adjustment };
  }
  return person;
};

export default Example;
