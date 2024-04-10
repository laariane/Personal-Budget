//Mock data 
//will replace this with either a MongoDB cluster or Postgres
//will add Mock User Data 
export interface Envelope{
 [key:string]:number;
}
type EnvelopesArray=Envelope[]

export const budgetData={
 budget:0,
 envelopes:[] as EnvelopesArray
}
