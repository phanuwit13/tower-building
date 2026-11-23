import type { FillStats, Footprint } from '../game/types';

export const T = {
  appTitle: 'สร้างเมืองของฉัน',
  pickTheme: 'เลือกธีมเมือง',
  current: 'ชิ้นนี้',
  next: 'ชิ้นถัดไป',
  rotate: 'หมุน',
  place: 'วาง',
  hintTap: 'แตะพื้นเพื่อเลือกที่วาง',
  settings: 'ตั้งค่า',
  screenshot: 'ถ่ายรูป',
  close: 'ปิด',
  cancel: 'ยกเลิก',
  weather: { title: 'สภาพอากาศ', sunny: 'แดดออก', rain: 'ฝนตก' },
  time: { title: 'ช่วงเวลา', dawn: 'เช้าตรู่', day: 'กลางวัน', dusk: 'หัวค่ำ', night: 'กลางคืน' },
  ground: {
    title: 'พื้น', grass: 'หญ้า', dirt: 'ดิน', concrete: 'ปูน', sand: 'ทราย', snow: 'หิมะ', wood: 'พื้นไม้', moon: 'พื้นดวงจันทร์',
  },
  quality: { title: 'คุณภาพภาพ', pretty: 'สวย', smooth: 'ลื่น' },
  /** The floor drawer: [พื้น] opens it; groups and tiles have their own Thai names (src/floors). */
  floor: {
    open: 'พื้น', title: 'ปูพื้น', groups: 'หมวดพื้น', tools: 'เครื่องมือ',
    eraser: 'ยางลบ', done: 'เสร็จ', paint: '🖌 ปูพื้น', camera: '✋ ขยับกล้อง',
  },
  /** Back to theme select: every theme keeps its own city, so nothing is lost. */
  home: '🏠 เปลี่ยนธีม',
  /** On a theme select card whose city's round is finished. */
  cityDone: 'เมืองเสร็จแล้ว',
  restart: 'เริ่มใหม่',
  confirmRestart: 'เริ่มเมืองนี้ใหม่ไหม? ของและพื้นที่ปูไว้ในเมืองนี้จะหายไป ส่วนเมืองของธีมอื่นยังอยู่',
  confirmRestartOk: 'เริ่มใหม่',
  clear: 'เคลียร์',
  confirmClear: 'ลบทุกเมืองของทุกธีม แล้วกลับไปเลือกธีมไหม? ลบแล้วเอาคืนไม่ได้',
  confirmClearOk: 'ลบทุกเมือง',
  endTitle: 'เมืองเสร็จแล้ว!',
  viewCity: 'ดูเมือง',
  noticeQualityDrop: 'เปลี่ยนเป็นโหมดลื่น เพื่อให้เล่นได้ไม่กระตุก',
  noticeSaveFailed: 'เครื่องนี้บันทึกเมืองไม่ได้ ถ้าปิดหน้าเว็บ เมืองจะหายไป',
  noticeShotSaved: 'บันทึกรูปแล้ว',
  noWebGL: 'เครื่องนี้เปิดเกม 3 มิติไม่ได้ ลองกดโหลดหน้าใหม่ หรือเปิดด้วย Chrome หรือ Safari รุ่นใหม่',
} as const;

export const placedLabel = (n: number): string => `วางแล้ว ${n} ชิ้น`;
/** On a theme select card: how many items that theme's city has. */
export const builtLabel = (n: number): string => `สร้างแล้ว ${n} ชิ้น`;
export const summaryLabel = (s: FillStats): string => `วางไป ${s.items} ชิ้น · ใช้พื้นที่ ${s.percent}%`;
export const sizeLabel = (fp: Footprint): string => `${fp.w}×${fp.d} ช่อง`;
export const floorCountLabel = (n: number): string => `${n} ช่อง`;
