import { LoglarPaneli } from "../../../components/loglar-paneli";
import { PanelKabugu } from "../../../components/panel-kabugu";

export default function LoglarSayfasi() {
  return (
    <PanelKabugu
      baslik="Loglar"
      altBaslik="Lisans doğrulama ve yönetim işlemlerinin proje bazlı Türkçe kayıtlarını bu ekranda incele."
    >
      <LoglarPaneli />
    </PanelKabugu>
  );
}
