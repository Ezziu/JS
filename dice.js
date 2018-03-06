let dice = [1,5,5,5,5];

function score(dice) {

let results = [0, 0, 0, 0, 0, 0]
let finscore = 0
for (i = 0; i < dice.length; i++) {
  results[dice[i] - 1]++;
}
for (i = 0; i < results.length ; i++)
  if (results[0] >= 3) {
   finscore += 1000;
   results[0] -= 3;
}
  else if (results[i] >=3){
    finscore += (i+1)*100;  
    results[i] -= 3; 
  }

finscore += (results[0] * 100);
finscore += (results[4] * 50);

return finscore;

}

console.log(score(dice))