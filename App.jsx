
import React, { useEffect, useState } from "react";
import { Menu, Search, Database, ChevronDown, ChevronRight } from "lucide-react";

/* SAP Portal Style Frontend - App.jsx
   This is a single-file React UI (mock data) intended to run in Vite + Tailwind.
*/

const Avs = [
  ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-full">
      <defs>
        <linearGradient id="g1" x1="0" x2="1"><stop offset="0" stopColor="#0284c7" /><stop offset="1" stopColor="#0ea5e9" /></linearGradient>
      </defs>
      <rect rx="18" width="100" height="100" fill="url(#g1)" />
      <circle cx="50" cy="36" r="16" fill="#fff" />
    </svg>
  ),
  ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" className="rounded-full">
      <defs>
        <linearGradient id="g2" x1="0" x2="1"><stop offset="0" stopColor="#60a5fa" /><stop offset="1" stopColor="#7dd3fc" /></linearGradient>
      </defs>
      <rect rx="18" width="100" height="100" fill="url(#g2)" />
      <path d="M50 28a14 14 0 1 0 0 28a14 14 0 1 0 0-28z" fill="#fff" />
    </svg>
  ),
];

function Avatar({ name, index = 0, size = 40 }) {
  const Av = Avs[index % Avs.length];
  return <Av size={size} />;
}

// Minimal mock portal metadata (modules, tcodes, tables, fields)
const defaultPortal = {
  MDM: {
    desc: "Master Data Management - canonical masters",
    tcodes: [
      { code: "MM01", name: "Create Material Master", desc: "Create or change material master (product)" },
      { code: "BP", name: "Business Partner", desc: "Manage business partner (customers, vendors)" },
    ],
    tables: {
      MARA: {
        desc: "General material data (canonical product master)",
        most_used: true,
        fields: [
          { name: "MATNR", type: "CHAR(18)", key: true, nullable: false, desc: "Material Number (PK)" },
          { name: "ERSDA", type: "DATE", key: false, nullable: false, desc: "Created on" },
          { name: "MTART", type: "CHAR(4)", key: false, nullable: true, desc: "Material Type" },
          { name: "MBRSH", type: "CHAR(10)", key: false, nullable: true, desc: "Industry sector" },
        ],
        relationships: [{ table: "MARC", relation: "MATNR -> MATNR", note: "Plant-specific data" }],
        sample: [{ MATNR: "MAT-0001", ERSDA: "2023-10-01", MTART: "FERT", MBRSH: "MANU" }],
        usage: "Used across procurement, inventory, sales for product master references.",
      },
      KNA1: {
        desc: "Customer Master - general data",
        most_used: false,
        fields: [
          { name: "KUNNR", type: "CHAR(10)", key: true, nullable: false, desc: "Customer number (PK)" },
          { name: "NAME1", type: "CHAR(35)", key: false, nullable: false, desc: "Name" },
          { name: "LAND1", type: "CHAR(3)", key: false, nullable: true, desc: "Country" },
        ],
        relationships: [],
        sample: [{ KUNNR: "C-001", NAME1: "Acme Corp", LAND1: "IN" }],
        usage: "Customer master used by sales/invoicing.",
      },
    },
  },

  PO: {
    desc: "Purchase Order - procurement operations",
    tcodes: [
      { code: "ME21N", name: "Create PO", desc: "Create purchase order with header & items" },
      { code: "ME22N", name: "Change PO", desc: "Edit purchase orders" },
      { code: "ME23N", name: "Display PO", desc: "View purchase orders" },
    ],
    tables: {
      EKKO: {
        desc: "PO Header (EKKO)",
        most_used: true,
        fields: [
          { name: "EBELN", type: "CHAR(10)", key: true, nullable: false, desc: "PO number (PK)" },
          { name: "LIFNR", type: "CHAR(10)", key: false, nullable: false, desc: "Vendor (FK to LFA1)" },
          { name: "BSTYP", type: "CHAR(1)", key: false, nullable: true, desc: "Document category" },
          { name: "BSART", type: "CHAR(4)", key: false, nullable: true, desc: "PO type" },
        ],
        relationships: [{ table: "EKPO", relation: "EBELN -> EBELN", note: "Header->Items" }],
        sample: [{ EBELN: "PO1001", LIFNR: "V-001", BSTYP: "F", BSART: "NB" }],
        usage: "Header of purchase orders; link to EKPO for line items.",
      },
      EKPO: {
        desc: "PO Items (EKPO)",
        fields: [
          { name: "EBELP", type: "CHAR(5)", key: true, nullable: false, desc: "Item number (PK together with EBELN)" },
          { name: "EBELN", type: "CHAR(10)", key: true, nullable: false, desc: "PO number (FK to EKKO)" },
          { name: "MATNR", type: "CHAR(18)", key: false, nullable: false, desc: "Material number" },
          { name: "MENGE", type: "DEC(13,3)", key: false, nullable: false, desc: "Quantity ordered" },
          { name: "NETPR", type: "DEC(13,2)", key: false, nullable: true, desc: "Net price" },
        ],
        relationships: [{ table: "EKKO", relation: "EBELN -> EBELN", note: "Line->Header" }, { table: "MARA", relation: "MATNR -> MATNR", note: "Material" }],
        sample: [{ EBELN: "PO1001", EBELP: "0010", MATNR: "MAT-0001", MENGE: 10, NETPR: 1200 }],
        usage: "Line details for POs."
      },
    },
  },

  OPS_INV: {
    desc: "Operational Inventory - warehouse transactions",
    tcodes: [
      { code: "MIGO", name: "Goods Movement", desc: "Post goods movement (GR/IR, goods issue)" },
      { code: "MB1B", name: "Transfer Posting", desc: "Change stock types" },
    ],
    tables: {
      MSEG: {
        desc: "Document Segment: material document lines",
        most_used: true,
        fields: [
          { name: "MBLNR", type: "CHAR(10)", key: true, nullable: false, desc: "Material document number" },
          { name: "ZEILE", type: "NUMC(3)", key: true, nullable: false, desc: "Item in material document" },
          { name: "MATNR", type: "CHAR(18)", key: false, nullable: false, desc: "Material" },
          { name: "ERFMG", type: "DEC(13,3)", key: false, nullable: true, desc: "Qty" },
        ],
        relationships: [{ table: "MKPF", relation: "MBLNR -> MBLNR", note: "Document header" }],
        sample: [{ MBLNR: "MD-5001", ZEILE: "001", MATNR: "MAT-0001", ERFMG: 100 }],
        usage: "Material movements captured line by line."
      },
      MKPF: {
        desc: "Document Header for material documents",
        fields: [
          { name: "MBLNR", type: "CHAR(10)", key: true, nullable: false, desc: "Material document No (PK)" },
          { name: "BLDAT", type: "DATE", key: false, nullable: true, desc: "Document date" },
        ],
        relationships: [],
        sample: [{ MBLNR: "MD-5001", BLDAT: "2025-05-01" }],
        usage: "Header info for material movements."
      }
    }
  },

  ERPT: {
    desc: "Sales & Billing - orders, invoices",
    tcodes: [
      { code: "VA01", name: "Create Sales Order", desc: "Create sales orders" },
      { code: "VF01", name: "Create Billing Document", desc: "Generate invoice" },
    ],
    tables: {
      VBAK: {
        desc: "Sales document: header data",
        most_used: true,
        fields: [
          { name: "VBELN", type: "CHAR(10)", key: true, nullable: false, desc: "Sales document" },
          { name: "KUNNR", type: "CHAR(10)", key: false, nullable: false, desc: "Sold-to party (customer)" },
          { name: "AUDAT", type: "DATE", key: false, nullable: true, desc: "Document date" },
        ],
        relationships: [{ table: "VBAP", relation: "VBELN -> VBELN", note: "Header->Items" }],
        sample: [{ VBELN: "SO-2001", KUNNR: "C-001", AUDAT: "2025-06-15" }],
        usage: "Sales orders — central to sales process."
      },
      BKPF: {
        desc: "Accounting Document Header (finance integration)",
        fields: [
          { name: "BELNR", type: "CHAR(10)", key: true, nullable: false, desc: "Accounting document no" },
          { name: "BLDAT", type: "DATE", key: false, nullable: false, desc: "Document date" },
        ],
        sample: [{ BELNR: "A-1001", BLDAT: "2025-07-01" }],
        usage: "Accounting header for GL postings tied to invoices/receipts."
      }
    }
  },

  MAS: { desc: "Manufacturing (BOM, Production)", tcodes: [{ code: "CO01", name: "Create Production Order", desc: "Create production order" }], tables: { AFKO: { desc: "Order header", fields: [{ name: "AUFNR", type: "CHAR(12)", key: true, nullable: false, desc: "Order" }], sample: [{ AUFNR: "PR-100" }], relationships: [], usage: "Production order header" } },

  "OHF (finance)": { desc: "Finance - GL/AP/AR", tcodes: [{ code: "FB50", name: "GL Posting", desc: "Post GL document" }], tables: { BSEG: { desc: "Accounting Document Segment (line items)", fields: [{ name: "BELNR", type: "CHAR(10)", key: true, nullable: false, desc: "Doc number" }, { name: "BUZEI", type: "NUMC(3)", key: true, nullable: false, desc: "Line item" }, { name: "DMBTR", type: "DEC(15,2)", key: false, nullable: true, desc: "Amount" }], sample: [{ BELNR: "A-1001", BUZEI: "001", DMBTR: 15000 }], relationships: [], usage: "Accounting line items" } },

  ETP: { desc: "Integration Layer", tcodes: [{ code: "SXMB_MONI", name: "Proxy Monitor", desc: "Monitor integration messages" }], tables: { SXMSGS: { desc: "Proxy messages", fields: [{ name: "MSG_ID", type: "CHAR(36)", key: true, nullable: false, desc: "Message id" }], sample: [{ MSG_ID: "MSG-1" }], relationships: [], usage: "Integration messages log" } },

  Corp_INV: { desc: "Corporate Valuation & Reporting", tcodes: [{ code: "MB52", name: "List Warehouse Stocks", desc: "Stock overview" }], tables: { MARD: { desc: "Storage location stock", fields: [{ name: "MATNR", type: "CHAR(18)", key: true, nullable: false, desc: "Material" }, { name: "LGORT", type: "CHAR(4)", key: true, nullable: false, desc: "Storage location" }, { name: "LABST", type: "DEC(13,3)", key: false, nullable: true, desc: "Stock" }], sample: [{ MATNR: "MAT-0001", LGORT: "W01", LABST: 500 }], relationships: [], usage: "Stock per location" } },

  CUR_PP: { desc: "Pricing & Planning", tcodes: [{ code: "VK11", name: "Create Condition (Price)", desc: "Maintain price conditions" }], tables: { KONV: { desc: "Conditions (pricing) table", fields: [{ name: "KNUMH", type: "CHAR(10)", key: true, nullable: false, desc: "Condition record number" }], sample: [{ KNUMH: "KR-1" }], relationships: [], usage: "Pricing conditions" } },

  Commission: { desc: "Commissions for sales", tcodes: [{ code: "ZSCP", name: "Commission Posting", desc: "Post commissions" }], tables: { COMM_PAYOUT: { desc: "Commission payouts", fields: [{ name: "PAYOUT_ID", type: "CHAR(20)", key: true, nullable: false, desc: "Payout id" }, { name: "AMOUNT", type: "DEC(12,2)", key: false, nullable: false, desc: "Amount" }], sample: [{ PAYOUT_ID: "CP-202507", AMOUNT: 750 }], relationships: [], usage: "Commission payouts" } }
};

function useLocal(key, initial) {
  const [s, setS] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : initial;
    } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(s)); }, [key, s]);
  return [s, setS];
}

export default function App() {
  const [portal, setPortal] = useLocal('sap_portal_meta', defaultPortal);
  const [moduleKey, setModuleKey] = useState(Object.keys(portal)[0]);
  const [expanded, setExpanded] = useLocal('sap_ui_expanded', {});
  const [selectedTable, setSelectedTable] = useState(() => {
    const m = Object.keys(portal)[0];
    const t = Object.keys(portal[m].tables)[0];
    return `${m}::${t}`;
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const [m, t] = selectedTable.split('::');
    if (!portal[m] || !portal[m].tables[t]) {
      const m0 = Object.keys(portal)[0];
      const t0 = Object.keys(portal[m0].tables)[0];
      setSelectedTable(`${m0}::${t0}`);
    }
  }, [portal]);

  function toggleModule(m) {
    setExpanded({ ...expanded, [m]: !expanded[m] });
    setModuleKey(m);
  }

  function exportTableJSON(m, t) {
    const data = portal[m].tables[t];
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${m}_${t}_meta.json`; a.click(); URL.revokeObjectURL(url);
  }
  function exportTableCSV(m, t) {
    const data = portal[m].tables[t];
    const rows = data.sample && data.sample.length ? data.sample : [];
    if (!rows.length) { alert('No sample rows to export'); return; }
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(','), ...rows.map(r=>keys.map(k=>`"${String(r[k] ?? '')}"`).join(','))].join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${m}_${t}_sample.csv`; a.click(); URL.revokeObjectURL(url);
  }

  function updateTableDesc(m, t) {
    const newDesc = prompt('Edit table description', portal[m].tables[t].desc);
    if (newDesc === null) return;
    const copy = { ...portal }; copy[m] = { ...copy[m], tables: { ...copy[m].tables } }; copy[m].tables[t] = { ...copy[m].tables[t], desc: newDesc }; setPortal(copy);
  }

  const [selModule, selTable] = selectedTable.split('::');
  const selTableObj = portal[selModule]?.tables[selTable];

  const filteredModules = Object.keys(portal).filter(m => {
    const pm = portal[m];
    if (!search) return true;
    const q = search.toLowerCase();
    if (m.toLowerCase().includes(q) || pm.desc.toLowerCase().includes(q)) return true;
    if (pm.tcodes.some(tc => tc.code.toLowerCase().includes(q) || tc.name.toLowerCase().includes(q) || tc.desc.toLowerCase().includes(q))) return true;
    if (Object.keys(pm.tables).some(t => t.toLowerCase().includes(q) || (pm.tables[t].desc || '').toLowerCase().includes(q))) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-sky-700 to-sky-600 text-white p-4 flex items-center gap-4">
        <div className="flex items-center gap-3"><Menu /><div className="font-semibold text-lg">SAP Portal — Explorer</div></div>
        <div className="flex-1">
          <div className="max-w-2xl mx-auto relative">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search modules, T-codes, tables..." className="w-full rounded-full p-2 text-slate-800" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2"><Search size={16} /></div>
          </div>
        </div>
        <div className="flex items-center gap-3"><div className="text-sm">ERP Admin</div><Avatar name="ERP Admin" /></div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4">
        <aside className="col-span-3 bg-white rounded-xl shadow p-3 h-[72vh] overflow-auto">
          <div className="flex items-center gap-2 font-medium mb-3"><Database /> Modules & T-codes</div>
          <div className="space-y-2">
            {filteredModules.map(mk => (
              <div key={mk} className="border-b pb-2">
                <button onClick={()=>toggleModule(mk)} className="w-full text-left flex items-center justify-between py-2">
                  <div>
                    <div className="font-semibold">{mk}</div>
                    <div className="text-xs text-slate-500">{portal[mk].desc}</div>
                  </div>
                  <div className="text-slate-400">{expanded[mk] ? <ChevronDown /> : <ChevronRight />}</div>
                </button>

                {expanded[mk] && (
                  <div className="mt-2 pl-3 space-y-1">
                    <div className="text-xs text-slate-500 font-medium">T-Codes</div>
                    {portal[mk].tcodes.map(tc => (
                      <div key={tc.code} className="flex items-start gap-2 p-1 rounded hover:bg-slate-50 cursor-pointer" title={tc.desc} onClick={()=>{ setModuleKey(mk); setSelectedTable(`${mk}::${Object.keys(portal[mk].tables)[0]}`); }}>
                        <div className="text-xs font-mono w-20">{tc.code}</div>
                        <div className="text-sm"><div className="font-medium">{tc.name}</div><div className="text-xs text-slate-500">{tc.desc}</div></div>
                      </div>
                    ))}
                    <div className="mt-2 text-xs text-slate-400">Tables: {Object.keys(portal[mk].tables).length}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        <main className="col-span-6">
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">{moduleKey}</div>
                <div className="text-xs text-slate-500 mt-1">{portal[moduleKey].desc}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{ navigator.clipboard.writeText(JSON.stringify(portal[moduleKey], null,2)).then(()=>alert('Module JSON copied')) }} className="px-3 py-2 bg-white border rounded">Copy JSON</button>
                <button onClick={()=>{ const blob=new Blob([JSON.stringify(portal[moduleKey], null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${moduleKey}_meta.json`; a.click(); URL.revokeObjectURL(url); }} className="px-3 py-2 bg-sky-600 text-white rounded">Export Module</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {Object.entries(portal[moduleKey].tables).map(([tkey, tdef]) => (
              <div key={tkey} className={`bg-white rounded-xl shadow p-4 ${selectedTable===`${moduleKey}::${tkey}` ? 'ring-2 ring-sky-200' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{tkey} {tdef.most_used && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded ml-2">Most used</span>}</div>
                    <div className="text-xs text-slate-500">{tdef.desc}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>{ setSelectedTable(`${moduleKey}::${tkey}`); }} className="px-3 py-1 border rounded">Inspect</button>
                    <button onClick={()=>exportTableJSON(moduleKey, tkey)} className="px-3 py-1 border rounded">JSON</button>
                    <button onClick={()=>exportTableCSV(moduleKey, tkey)} className="px-3 py-1 border rounded">CSV</button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">Fields</div>
                <div className="mt-2 overflow-auto">
                  <table className="w-full text-sm table-auto">
                    <thead>
                      <tr className="text-left text-xs text-slate-500"><th>Name</th><th>Type</th><th>Key</th><th>Nullable</th><th>Description</th></tr>
                    </thead>
                    <tbody>
                      {tdef.fields.map(f => (
                        <tr key={f.name} className="border-t">
                          <td className="py-2 font-mono">{f.name}</td>
                          <td className="py-2">{f.type}</td>
                          <td className="py-2">{f.key ? 'PK' : ''}</td>
                          <td className="py-2">{f.nullable ? 'YES' : 'NO'}</td>
                          <td className="py-2 text-slate-600">{f.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            ))}
          </div>
        </main>

        <aside className="col-span-3">
          <div className="sticky top-20 space-y-3">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between"><div className="font-semibold">Table Details</div>
                <div className="text-xs text-slate-400">{selModule} / {selTable}</div>
              </div>

              {!selTableObj ? (
                <div className="text-xs text-slate-500 mt-3">Select a table to view its details</div>
              ) : (
                <div className="mt-3">
                  <div className="text-sm font-medium">{selTable}</div>
                  <div className="text-xs text-slate-500">{selTableObj.desc}</div>

                  <div className="mt-3 text-xs text-slate-500">Relationships</div>
                  <div className="mt-2 text-sm">
                    {selTableObj.relationships && selTableObj.relationships.length ? selTableObj.relationships.map((r,i)=> (
                      <div key={i} className="p-2 rounded border mb-2"><div className="font-mono text-xs">{r.relation}</div><div className="text-xs text-slate-600">{r.note}</div></div>
                    )) : <div className="text-xs text-slate-500">No relationships recorded.</div>}
                  </div>

                  <div className="mt-3 text-xs text-slate-500">Usage & Notes</div>
                  <div className="mt-2 text-sm text-slate-700">{selTableObj.usage || 'No usage notes available.'}</div>

                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>exportTableJSON(selModule, selTable)} className="px-3 py-2 border rounded text-sm">Export JSON</button>
                    <button onClick={()=>exportTableCSV(selModule, selTable)} className="px-3 py-2 border rounded text-sm">Export CSV</button>
                    <button onClick={()=>updateTableDesc(selModule, selTable)} className="px-3 py-2 bg-sky-600 text-white rounded text-sm">Edit Description</button>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-slate-500">Sample rows</div>
                    <div className="mt-2 overflow-auto">
                      {selTableObj.sample && selTableObj.sample.length ? (
                        <table className="w-full text-xs table-auto">
                          <thead>
                            <tr className="text-left text-xs text-slate-500">{Object.keys(selTableObj.sample[0]).map(k=><th key={k} className="pr-2">{k}</th>)}</tr>
                          </thead>
                          <tbody>
                            {selTableObj.sample.map((r,i)=> (
                              <tr key={i} className="border-t">{Object.keys(r).map(k=><td key={k} className="py-1 pr-2 font-mono">{String(r[k])}</td>)}</tr>
                            ))}
                          </tbody>
                        </table>
                      ) : <div className="text-xs text-slate-500">No sample rows</div>}
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-4 text-xs text-slate-500">
              Tip: Click a T-code to jump to the module and inspect its common tables. Use "Edit Description" to add plain-language notes for your team.
            </div>

          </div>
        </aside>

      </div>

      <footer className="text-center p-4 text-sm text-slate-500">SAP Portal style frontend — mock metadata only. Customize or connect to SE11/DB to load live schemas.</footer>
    </div>
  );
}
