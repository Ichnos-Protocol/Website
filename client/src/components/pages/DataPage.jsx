import Container from "react-bootstrap/Container";

import { DATA_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import SeoHead from "../molecules/SeoHead";
import DataHero from "../organisms/DataHero";
import DataProblemSection from "../organisms/DataProblemSection";
import DataSolutionSection from "../organisms/DataSolutionSection";
import DataSchemaMappingTable from "../organisms/DataSchemaMappingTable";
import DataFounderPillars from "../organisms/DataFounderPillars";
import DataClosingCta from "../organisms/DataClosingCta";

export default function DataPage() {
  return (
    <>
      <SeoHead meta={DATA_META} schemas={PAGE_STRUCTURED_DATA.data} />
      <DataHero />
      <Container>
        <DataProblemSection />
        <DataSolutionSection />
        <DataSchemaMappingTable />
        <DataFounderPillars />
        <DataClosingCta />
      </Container>
    </>
  );
}
