export const DRAMA_EVENTS=[
 {at:12.3,type:'material_compared',projectId:'home-a',causalTag:'material_choice_a'},
 {at:19.7,type:'idea_shift',projectId:'home-a',causalTag:'straw_unfinished_binding',from:'binding_finish',to:'roof_appearance'},
 {at:21.7,type:'task_deferred',projectId:'home-a',causalTag:'straw_unfinished_binding',task:'binding_finish'},
 {at:27.3,type:'material_compared',projectId:'home-b',causalTag:'material_choice_b'},
 {at:36.8,type:'task_deferred',projectId:'home-b',causalTag:'wood_deferred_brace',task:'last_brace'},
 {at:42.3,type:'material_compared',projectId:'home-c',causalTag:'material_choice_c'},
 {at:45,type:'repeated_check',projectId:'home-c',causalTag:'brick_shared_plan',qualityChange:false},
 {at:46.5,type:'repeated_check',projectId:'home-c',causalTag:'brick_shared_plan',qualityChange:false},
 {at:47.6,type:'help_offered',projectId:'home-c',helperProjectId:'home-b',causalTag:'brick_shared_plan'},
 {at:47.9,type:'plan_conflict',projectId:'home-c',causalTag:'brick_shared_plan',progressAllowed:false},
 {at:53.6,type:'role_agreed',projectId:'home-c',helperProjectId:'home-b',causalTag:'brick_shared_plan',task:'support_wall'},
 {at:71.5,type:'pressure_recall',projectId:'home-a',causalTag:'straw_unfinished_binding'},
 {at:86.3,type:'pressure_recall',projectId:'home-b',causalTag:'wood_deferred_brace'},
 {at:103.7,type:'pressure_recall',projectId:'home-c',causalTag:'brick_shared_plan'}
];
export function causalHistoryAt(t){return DRAMA_EVENTS.filter(e=>e.at<=t).map(e=>({...e}));}
