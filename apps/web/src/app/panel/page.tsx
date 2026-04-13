import { DashboardOzetiBileseni } from "../../components/dashboard-ozeti";
import { PanelKabugu } from "../../components/panel-kabugu";

export default function DashboardSayfasi() {
  return (
    <PanelKabugu
      baslik="Dashboard"
      altBaslik="Projelerin, lisansların ve son işlemlerin genel görünümünü bu ekranda izleyebilirsin."
    >
      <DashboardOzetiBileseni />
    </PanelKabugu>
  );
}
