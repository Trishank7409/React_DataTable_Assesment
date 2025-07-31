
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useEffect, useRef, useState } from 'react';
import { Paginator, type PaginatorPageChangeEvent } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';

interface DataListItem {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  date_start: number;
  date_end: number;
}
const DataList: React.FC = () => {
  const [data, setData] = useState<DataListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<number>(12);
  const [total_Record, setTotalRecord] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const overlayRef = useRef<OverlayPanel>(null);
  const [rowInput, setRowInput] = useState<number>(0);

  useEffect(() => {
        const fetchData = async () => {
      try {
        console.log("Fetching data for page:", page, "with rows:", rows);
        setLoading(true);
        const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rows}`);
        const json = await response.json();
        setData(json.data as DataListItem[]);
        setTotalRecord(json.pagination.total);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, rows]);
  const onPageChange = (event: PaginatorPageChangeEvent) => {
    const newPage = event.first / event.rows + 1; // Convert to 1-based page number
    setPage(newPage);
    setRows(event.rows);
  };
const handleOverlayToggle = (event: React.MouseEvent) => {
  overlayRef.current?.toggle(event);
};
  const handleRowInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowInput(Number(e.target.value));
  };

  const handleSubmitRowSelect = async () => {
    overlayRef.current?.hide();

    if (rowInput <= 0 || isNaN(rowInput)) return;

    let collectedRows: DataListItem[] = [];
    let currentPage = page;
    let totalPages = Math.ceil(total_Record / rows);

    while (collectedRows.length < rowInput && currentPage <= totalPages) {
      try {
        const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${rows}`);
        const json = await response.json();
        const pageData = json.data as DataListItem[];
        collectedRows = [...collectedRows, ...pageData];

        if (collectedRows.length >= rowInput) break;

        currentPage++;
      } catch (error) {
        console.error("Error fetching paginated rows", error);
        break;
      }
    }

    setSelectedRows(collectedRows.slice(0, rowInput));
    setData(collectedRows.slice(0, rows)); // Only display current page
  };

  return (
    <div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
          <ProgressSpinner />
        </div>
      ) : (
        <div>
        <DataTable value={data} tableStyle={{ minWidth: '45rem' }} selection={selectedRows} onSelectionChange={(e) => setSelectedRows(e.value)}
      dataKey="id" 
      >
          <Column selectionMode="multiple"  headerStyle={{ width: '0.5rem', contentVisibility: 'hidden',  }} />
          <Column header={<i className="pi pi-chevron-down" onClick={handleOverlayToggle} style={{ fontSize: '1rem', position:'absolute', left:'20px', top:'25px', cursor:'pointer' }}></i>} />
          <Column field="id" header="ID" />
          <Column field="title" header="Title" />
          <Column field="place_of_origin" header="Place Of Origin" />
          <Column field="artist_display" header="Artist Display" />
          <Column field="date_start" header="From" />
          <Column field="date_end" header="To" />
        </DataTable>
        <Paginator first={(page - 1) * rows} rows={rows} totalRecords={total_Record} rowsPerPageOptions={[5, 12, 20]} onPageChange={onPageChange} />


        {/* Overlay Panel for Row Selection */}

        <OverlayPanel ref={overlayRef}>
          <form onSubmit={(e) => e.preventDefault()}>
           <input
                type="number"
                value={rowInput}
                onChange={handleRowInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  marginBottom: '10px',
                  borderRadius: '4px',
                }}
                placeholder="Select no. of rows..."
              />
              <Button label="Submit" onClick={handleSubmitRowSelect} />
          </form>
        </OverlayPanel>
        </div>

      )}
    </div>
  )
}

export default DataList
