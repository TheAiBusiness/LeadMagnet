/* Stub: jsPDF imports html2canvas but we never use jsPDF.html(). 
   This empty export prevents the 200KB library from entering the bundle. */
export default function html2canvas(): Promise<HTMLCanvasElement> {
  throw new Error("html2canvas is not available");
}
