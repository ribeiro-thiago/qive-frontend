import { ImportarDocumentosPage } from "../../documentos/ImportarDocumentosPage";
import { portalImportReturnPath } from "../../lib/portal-paths";

export default function Page() {
  return (
    <ImportarDocumentosPage returnPath={portalImportReturnPath("cte-os")} importSegment="cte-os" />
  );
}
