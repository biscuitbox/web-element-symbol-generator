const logEl = document.getElementById('log');
const tableEl = document.getElementById('periodicTable');
const selected = new Set();

const MODEL_BODY = `corner_radius = 5;
base_thickness = 4;
frame_width = 1.8;
frame_height = 0.6;
text_height = 0.6;
slot_width = 25; slot_height = 2.0; slot_depth = 3.0; slot_z = 1.2;
fit_clearance = 0.15; connector_length = slot_width - 0.2; connector_height = slot_height - fit_clearance;
connector_depth = 2*(slot_depth - fit_clearance); connector_gap = 8; connector_corner = 0.6;
atomic_x = -28; atomic_y = 28; symbol_x = 0; symbol_y = 9; name_x = 0; name_y = -16; number_x = 0; number_y = -28;
module rounded_square(sz, r) { offset(r = r) square([sz - 2*r, sz - 2*r], center = true); }
module outer_shape_2d() { rounded_square(tile_size, corner_radius); }
frame_inset = 0.25;
module outer_frame_2d() { difference() { offset(delta = -frame_inset) outer_shape_2d(); offset(delta = -(frame_inset + frame_width)) outer_shape_2d(); } }
module base_body() { linear_extrude(height = base_thickness) outer_shape_2d(); }
module top_outer_frame() { translate([0,0,base_thickness]) linear_extrude(height = frame_height) outer_frame_2d(); }
module left_slot() { translate([-tile_size/2 - 0.1, -slot_width/2, slot_z]) cube([slot_depth + 0.2, slot_width, slot_height]); }
module right_slot() { translate([tile_size/2 - slot_depth + 0.1, -slot_width/2, slot_z]) cube([slot_depth + 0.2, slot_width, slot_height]); }
module texts() {
 translate([atomic_x, atomic_y, base_thickness]) linear_extrude(height = text_height) text(atomic_number, size = atomic_size, halign = "center", valign = "center", font = font_name);
 translate([symbol_x, symbol_y, base_thickness]) linear_extrude(height = text_height) text(symbol, size = symbol_size, halign = "center", valign = "center", font = font_name);
 translate([name_x, name_y, base_thickness]) linear_extrude(height = text_height) text(name, size = name_size, halign = "center", valign = "center", font = font_name);
 translate([number_x, number_y, base_thickness]) linear_extrude(height = text_height) text(number, size = number_size, halign = "center", valign = "center", font = font_name);
}
module tile() { difference() { union() { base_body(); top_outer_frame(); texts(); } left_slot(); right_slot(); } }
if (show_tile) tile();`;

const E = [
[1,'H',1,1],[2,'He',1,18],[3,'Li',2,1],[4,'Be',2,2],[5,'B',2,13],[6,'C',2,14],[7,'N',2,15],[8,'O',2,16],[9,'F',2,17],[10,'Ne',2,18],
[11,'Na',3,1],[12,'Mg',3,2],[13,'Al',3,13],[14,'Si',3,14],[15,'P',3,15],[16,'S',3,16],[17,'Cl',3,17],[18,'Ar',3,18],
[19,'K',4,1],[20,'Ca',4,2],[21,'Sc',4,3],[22,'Ti',4,4],[23,'V',4,5],[24,'Cr',4,6],[25,'Mn',4,7],[26,'Fe',4,8],[27,'Co',4,9],[28,'Ni',4,10],[29,'Cu',4,11],[30,'Zn',4,12],[31,'Ga',4,13],[32,'Ge',4,14],[33,'As',4,15],[34,'Se',4,16],[35,'Br',4,17],[36,'Kr',4,18],
[37,'Rb',5,1],[38,'Sr',5,2],[39,'Y',5,3],[40,'Zr',5,4],[41,'Nb',5,5],[42,'Mo',5,6],[43,'Tc',5,7],[44,'Ru',5,8],[45,'Rh',5,9],[46,'Pd',5,10],[47,'Ag',5,11],[48,'Cd',5,12],[49,'In',5,13],[50,'Sn',5,14],[51,'Sb',5,15],[52,'Te',5,16],[53,'I',5,17],[54,'Xe',5,18],
[55,'Cs',6,1],[56,'Ba',6,2],[57,'La',8,4],[58,'Ce',8,5],[59,'Pr',8,6],[60,'Nd',8,7],[61,'Pm',8,8],[62,'Sm',8,9],[63,'Eu',8,10],[64,'Gd',8,11],[65,'Tb',8,12],[66,'Dy',8,13],[67,'Ho',8,14],[68,'Er',8,15],[69,'Tm',8,16],[70,'Yb',8,17],[71,'Lu',8,18],
[72,'Hf',6,4],[73,'Ta',6,5],[74,'W',6,6],[75,'Re',6,7],[76,'Os',6,8],[77,'Ir',6,9],[78,'Pt',6,10],[79,'Au',6,11],[80,'Hg',6,12],[81,'Tl',6,13],[82,'Pb',6,14],[83,'Bi',6,15],[84,'Po',6,16],[85,'At',6,17],[86,'Rn',6,18],
[87,'Fr',7,1],[88,'Ra',7,2],[89,'Ac',9,4],[90,'Th',9,5],[91,'Pa',9,6],[92,'U',9,7],[93,'Np',9,8],[94,'Pu',9,9],[95,'Am',9,10],[96,'Cm',9,11],[97,'Bk',9,12],[98,'Cf',9,13],[99,'Es',9,14],[100,'Fm',9,15],[101,'Md',9,16],[102,'No',9,17],[103,'Lr',9,18],
[104,'Rf',7,4],[105,'Db',7,5],[106,'Sg',7,6],[107,'Bh',7,7],[108,'Hs',7,8],[109,'Mt',7,9],[110,'Ds',7,10],[111,'Rg',7,11],[112,'Cn',7,12],[113,'Nh',7,13],[114,'Fl',7,14],[115,'Mc',7,15],[116,'Lv',7,16],[117,'Ts',7,17],[118,'Og',7,18]
];

const AW = {
H:'1.008',He:'4.0026',Li:'6.94',Be:'9.0122',B:'10.81',C:'12.011',N:'14.007',O:'15.999',F:'18.998',Ne:'20.180',
Na:'22.990',Mg:'24.305',Al:'26.982',Si:'28.085',P:'30.974',S:'32.06',Cl:'35.45',Ar:'39.948',K:'39.098',Ca:'40.078',
Sc:'44.956',Ti:'47.867',V:'50.942',Cr:'51.996',Mn:'54.938',Fe:'55.845',Co:'58.933',Ni:'58.693',Cu:'63.546',Zn:'65.38',
Ga:'69.723',Ge:'72.630',As:'74.922',Se:'78.971',Br:'79.904',Kr:'83.798',Rb:'85.468',Sr:'87.62',Y:'88.906',Zr:'91.224',
Nb:'92.906',Mo:'95.95',Tc:'98',Ru:'101.07',Rh:'102.91',Pd:'106.42',Ag:'107.87',Cd:'112.41',In:'114.82',Sn:'118.71',
Sb:'121.76',Te:'127.60',I:'126.90',Xe:'131.29',Cs:'132.91',Ba:'137.33',La:'138.91',Ce:'140.12',Pr:'140.91',Nd:'144.24',
Pm:'145',Sm:'150.36',Eu:'151.96',Gd:'157.25',Tb:'158.93',Dy:'162.50',Ho:'164.93',Er:'167.26',Tm:'168.93',Yb:'173.05',
Lu:'174.97',Hf:'178.49',Ta:'180.95',W:'183.84',Re:'186.21',Os:'190.23',Ir:'192.22',Pt:'195.08',Au:'196.97',Hg:'200.59',
Tl:'204.38',Pb:'207.2',Bi:'208.98',Po:'209',At:'210',Rn:'222',Fr:'223',Ra:'226',Ac:'227',Th:'232.04',Pa:'231.04',U:'238.03',
Np:'237',Pu:'244',Am:'243',Cm:'247',Bk:'247',Cf:'251',Es:'252',Fm:'257',Md:'258',No:'259',Lr:'262',Rf:'267',Db:'268',
Sg:'271',Bh:'270',Hs:'277',Mt:'278',Ds:'281',Rg:'282',Cn:'285',Nh:'286',Fl:'289',Mc:'290',Lv:'293',Ts:'294',Og:'294'
};

const KR = {
H:'수소',He:'헬륨',Li:'리튬',Be:'베릴륨',B:'붕소',C:'탄소',N:'질소',O:'산소',F:'플루오린',Ne:'네온',
Na:'나트륨',Mg:'마그네슘',Al:'알루미늄',Si:'규소',P:'인',S:'황',Cl:'염소',Ar:'아르곤',K:'칼륨',Ca:'칼슘',
Sc:'스칸듐',Ti:'티타늄',V:'바나듐',Cr:'크로뮴',Mn:'망가니즈',Fe:'철',Co:'코발트',Ni:'니켈',Cu:'구리',Zn:'아연',
Ga:'갈륨',Ge:'게르마늄',As:'비소',Se:'셀레늄',Br:'브로민',Kr:'크립톤',Rb:'루비듐',Sr:'스트론튬',Y:'이트륨',Zr:'지르코늄',
Nb:'나이오븀',Mo:'몰리브데넘',Tc:'테크네튬',Ru:'루테늄',Rh:'로듐',Pd:'팔라듐',Ag:'은',Cd:'카드뮴',In:'인듐',Sn:'주석',
Sb:'안티모니',Te:'텔루륨',I:'아이오딘',Xe:'제논',Cs:'세슘',Ba:'바륨',La:'란타넘',Ce:'세륨',Pr:'프라세오디뮴',Nd:'네오디뮴',
Pm:'프로메튬',Sm:'사마륨',Eu:'유로퓸',Gd:'가돌리늄',Tb:'터븀',Dy:'디스프로슘',Ho:'홀뮴',Er:'어븀',Tm:'툴륨',Yb:'이터븀',
Lu:'루테튬',Hf:'하프늄',Ta:'탄탈럼',W:'텅스텐',Re:'레늄',Os:'오스뮴',Ir:'이리듐',Pt:'백금',Au:'금',Hg:'수은',
Tl:'탈륨',Pb:'납',Bi:'비스무트',Po:'폴로늄',At:'아스타틴',Rn:'라돈',Fr:'프랑슘',Ra:'라듐',Ac:'악티늄',Th:'토륨',
Pa:'프로트악티늄',U:'우라늄',Np:'넵투늄',Pu:'플루토늄',Am:'아메리슘',Cm:'퀴륨',Bk:'버클륨',Cf:'캘리포늄',Es:'아인슈타이늄',Fm:'페르뮴',
Md:'멘델레븀',No:'노벨륨',Lr:'로렌슘',Rf:'러더포듐',Db:'더브늄',Sg:'시보귬',Bh:'보륨',Hs:'하슘',Mt:'마이트너륨',Ds:'다름슈타튬',
Rg:'뢴트게늄',Cn:'코페르니슘',Nh:'니호늄',Fl:'플레로븀',Mc:'모스코븀',Lv:'리버모륨',Ts:'테네신',Og:'오가네손'
};

function log(msg) { logEl.textContent += msg + '\n'; }
function makeScad([z,s], o) { const n = KR[s] || s; const w = AW[s] || String(z); return `symbol = "${s}";\nname = "${n}";\nnumber = "${w}";\natomic_number = "${z}";\nfont_name = "${o.fontName}";\nshow_tile = true;\nshow_connector = false;\ntile_size = ${o.tileSize};\nsymbol_size = ${o.symbolSize};\nname_size = ${o.nameSize};\nnumber_size = ${o.numberSize};\natomic_size = ${o.atomicSize};\n${MODEL_BODY}\n`; }

function renderTable() {
  tableEl.innerHTML = '';
  E.forEach((e) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'el-cell';
    cell.style.gridColumn = e[3];
    cell.style.gridRow = e[2];
    cell.innerHTML = `<span class="z">${e[0]}</span><span class="s">${e[1]}</span>`;
    cell.addEventListener('click', () => {
      if (selected.has(e[0])) selected.delete(e[0]); else selected.add(e[0]);
      cell.classList.toggle('selected');
    });
    tableEl.appendChild(cell);
  });
}

renderTable();
document.getElementById('selectAllBtn').onclick = () => { selected.clear(); E.forEach((e)=>selected.add(e[0])); tableEl.querySelectorAll('.el-cell').forEach((c)=>c.classList.add('selected')); };
document.getElementById('clearAllBtn').onclick = () => { selected.clear(); tableEl.querySelectorAll('.el-cell').forEach((c)=>c.classList.remove('selected')); };

document.getElementById('generateBtn').onclick = async () => {
  logEl.textContent = '';
  if (selected.size === 0) return log('선택된 원소가 없습니다.');
  const o = {
    fontName: 'NanumGothic:style=Regular',
    tileSize: Number(document.getElementById('tileSize').value),
    symbolSize: Number(document.getElementById('symbolSize').value),
    nameSize: Number(document.getElementById('nameSize').value),
    numberSize: Number(document.getElementById('numberSize').value),
    atomicSize: Number(document.getElementById('atomicSize').value),
  };
  const zip = new JSZip();
  E.filter((e)=>selected.has(e[0])).forEach((e)=>{ zip.file(`${e[0]}_${e[1]}.scad`, makeScad(e,o)); log(`추가됨: ${e[0]}_${e[1]}.scad`); });
  zip.file('convert_to_stl.bat', '@echo off\r\nset OPENSCAD_EXE=C:\\Program Files\\OpenSCAD\\openscad.exe\r\nif not exist "%OPENSCAD_EXE%" (\r\n  echo OpenSCAD 경로를 찾을 수 없습니다: %OPENSCAD_EXE%\r\n  echo convert_to_stl.bat 파일에서 경로를 수정하세요.\r\n  pause\r\n  exit /b 1\r\n)\r\nif not exist stl mkdir stl\r\nfor %%f in (*.scad) do (\r\n  "%OPENSCAD_EXE%" -o "stl\\%%~nf.stl" "%%f"\r\n)\r\necho 완료: %cd%\\stl 폴더 확인\r\npause\r\n');
  zip.file('convert_to_stl.sh', '#!/usr/bin/env bash\nset -euo pipefail\ncommand -v openscad >/dev/null || { echo "OpenSCAD 없음"; exit 1; }\nmkdir -p stl\nfor f in *.scad; do b="${f%.scad}"; openscad -o "stl/${b}.stl" "$f"; done\necho "완료: $(pwd)/stl 폴더 확인"\n');
  const blob = await zip.generateAsync({ type:'blob' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='element_scad_files.zip'; a.click();
};