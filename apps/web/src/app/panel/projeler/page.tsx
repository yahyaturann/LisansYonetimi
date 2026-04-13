import { PanelKabugu } from "../../../components/panel-kabugu";
import { ProjelerYonetimi } from "../../../components/projeler-yonetimi";

export default function ProjelerSayfasi() {
  return (
    <PanelKabugu
      baslik="Projeler"
      altBaslik="Yeni proje oluştur, API anahtarlarını görüntüle ve lisans kural bayraklarını anında güncelle."
    >
      <ProjelerYonetimi />
    </PanelKabugu>
  );
}
