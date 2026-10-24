export function wolfStoryActing(t){
 if(t>=185.5)return t<186.4?{index:1,name:'scheme'}:{index:5,name:'cunning_idea'};
 if(t>=181.3)return{index:4,name:'frustration'};
 if(t>=177.5)return{index:3,name:'intimidation'};
 if(t>=176.3)return{index:4,name:'frustration'};
 if(t>=172.5)return{index:3,name:'intimidation'};
 if(t>=171.3)return{index:4,name:'frustration'};
 if(t>=167.3)return{index:3,name:'intimidation'};
 if(t>=153.35)return{index:1,name:'scheme'};
 if(t>=145.3)return{index:3,name:'intimidation'};
 if(t>=140.8)return{index:4,name:'frustration'};
 if(t>=136.7)return{index:3,name:'intimidation'};
 if(t>=125.4)return{index:1,name:'scheme'};
 if(t>=119)return{index:3,name:'intimidation'};
 if(t>=115.2)return{index:2,name:'deceptive_talk'};
 return{index:0,name:'targeting'};
}
