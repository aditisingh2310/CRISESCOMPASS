
export function predictRisk(data:{
  floodReports:number
  rainfall:number
  populationDensity:number
}){

 const score =
   data.floodReports * 0.6 +
   data.rainfall * 0.3 +
   data.populationDensity * 0.1

 if(score > 70) return "HIGH"
 if(score > 40) return "MEDIUM"
 return "LOW"
}
