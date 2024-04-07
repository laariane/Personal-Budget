export interface Envelope{
 [key:string]:number;
}
type EnvelopesArray=Envelope[]

export const budgetData={
 budget:0,
 envelopes:[] as EnvelopesArray
}
