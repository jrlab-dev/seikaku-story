const steps=[
 ['scenery','風景を準備しています'],['village','村と道を準備しています'],
 ['characters','登場人物の画像を読み込んでいます'],['faces','表情を準備しています'],
 ['run','走る動きを準備しています'],['paper','登場人物の動きを準備しています'],
 ['actions','家づくりの動きを準備しています'],['joy','完成した時の動きを準備しています'],
 ['wolf','おおかみの動きを準備しています'],['doors','出入りの動きを準備しています'],
 ['reactions','性格ごとの反応を準備しています'],['collapse','家が倒れる動きを読み込んでいます'],
 ['houses','この配役の家を読み込んでいます'],['construction','家づくりの場面を組み立てています'],
 ['home','物語の舞台を仕上げています'],['render','3Dの表示を準備しています'],
 ['effects','物語の演出を準備しています'],['audio','音声を準備しています']
];
const completed=new Set();let receiving=0,received=0,failed=false;
export function finishLoadStep(id){completed.add(id);}
export function failLoading(){failed=true;}
export function beginReceiving(){receiving++;}
export function endReceiving(bytes){receiving=Math.max(0,receiving-1);received=Math.max(0,received-bytes);}
export function receivedChunk(bytes){received+=bytes;}
export function getLoadProgress(){const next=steps.find(([id])=>!completed.has(id));return{percent:Math.floor(100*steps.filter(([id])=>completed.has(id)).length/steps.length),label:next?.[1]??'準備ができました',receiving:receiving>0,received,failed};}
