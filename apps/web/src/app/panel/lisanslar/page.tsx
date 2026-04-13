import { LisanslarYonetimi } from "../../../components/lisanslar-yonetimi";
import { PanelKabugu } from "../../../components/panel-kabugu";

export default function LisanslarSayfasi() {
  return (
    <PanelKabugu
      baslik="Lisanslar"
      altBaslik="Projeye bağlı lisans üret, bitiş tarihi ve aktivasyon sınırı tanımla, gerekirse kayıtları temizle."
    >
      <LisanslarYonetimi />
    </PanelKabugu>
  );
}
