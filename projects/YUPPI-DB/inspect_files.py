import os
import sys

def inspect_excel(filepath):
    try:
        import pandas as pd
        print(f"\n--- Excel File: {os.path.basename(filepath)} ---")
        xls = pd.ExcelFile(filepath)
        print("Sheets:", xls.sheet_names)
        for sheet in xls.sheet_names:
            df = pd.read_excel(filepath, sheet_name=sheet, nrows=5)
            print(f"  Sheet '{sheet}' Columns:")
            print(f"  {list(df.columns)}")
    except Exception as e:
        print(f"Error reading Excel {filepath}: {e}")

def inspect_docx(filepath):
    try:
        import docx
        print(f"\n--- Word Document: {os.path.basename(filepath)} ---")
        doc = docx.Document(filepath)
        print("First 20 paragraphs:")
        for i, para in enumerate(doc.paragraphs[:20]):
            if para.text.strip():
                print(f"  {para.text}")
    except Exception as e:
        print(f"Error reading Docx {filepath}: {e}")

def inspect_vba(filepath):
    try:
        from oletools.olevba import VBA_Parser
        print(f"\n--- VBA Macros in: {os.path.basename(filepath)} ---")
        vba_parser = VBA_Parser(filepath)
        if vba_parser.detect_vba_macros():
            for (filename, stream_path, vba_filename, vba_code) in vba_parser.extract_macros():
                print(f"  Macro Module: {vba_filename}")
                # Print just the first few lines of the code to get an idea
                code_lines = vba_code.splitlines()
                for line in code_lines[:10]:
                    print(f"    {line}")
                print("    ...")
        else:
            print("  No VBA macros found.")
    except Exception as e:
        print(f"Error parsing VBA {filepath}: {e}")

if __name__ == "__main__":
    docs_dir = r"c:\X\Antigravity\projects\YUPPI\docs"
    
    yuppi_xlsm = os.path.join(docs_dir, "Yuppi.xlsm")
    siparis_xlsx = os.path.join(docs_dir, "Siparis Durumu.xlsx")
    outline_docx = os.path.join(docs_dir, "YUPPI Outline.docx")
    
    inspect_excel(yuppi_xlsm)
    if os.path.exists(yuppi_xlsm):
        inspect_vba(yuppi_xlsm)
        
    inspect_excel(siparis_xlsx)
    inspect_docx(outline_docx)
