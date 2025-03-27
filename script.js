function generateQuizQuestion() {
    // Pick a random bacteria
    const bacteriaList = Object.keys(bacteriaProfiles);
    const randomBacteria = bacteriaList[Math.floor(Math.random() * bacteriaList.length)];
    const bacteriaData = bacteriaProfiles[randomBacteria];
    
    // Get positive tests
    const positiveTests = [];
    for (const [test, result] of Object.entries(bacteriaData)) {
      if (result === "+") positiveTests.push(test);
    }
    
    // Display tests
    const testsContainer = document.getElementById('quiz-tests');
    testsContainer.innerHTML = `
      <p><strong>Positive Tests:</strong></p>
      <div>${positiveTests.map(test => 
        `<span>${formatTestName(test)}</span>`
      ).join('')}</div>
    `;
    
    // Store correct answer
    testsContainer.dataset.correctAnswer = randomBacteria;
    document.getElementById('quiz-feedback').innerHTML = '';
    document.getElementById('guess-input').value = '';
}

function formatTestName(test) {
    // Convert camelCase to readable names
    return test
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('D Glucose', 'D-Glucose')
      .replace('Phenylalanine', 'Phenylalanine');
}

// Remove the duplicate checkGuess() function (keep only one)
// Keep all your existing bacteriaProfiles and other functions

// Initialize quiz mode if needed
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('submit-guess').addEventListener('click', checkGuess);
    document.getElementById('new-quiz').addEventListener('click', generateQuizQuestion);
});


function identifyBacteria() {
    // Get user inputs (only positive tests)
    const inputs = {
        indole: document.getElementById("indole").checked,
        methylRed: document.getElementById("methylRed").checked,
        vogesProskauer: document.getElementById("vogesProskauer").checked,
        citrate: document.getElementById("citrate").checked,
        h2s: document.getElementById("h2s").checked,
        urea: document.getElementById("urea").checked,
        motility: document.getElementById("motility").checked,
        lysineDecarboxylase: document.getElementById("lysineDecarboxylase").checked,
        arginineDihydrolase: document.getElementById("arginineDihydrolase").checked,
        ornithineDecarboxylase: document.getElementById("ornithineDecarboxylase").checked,
        phenylalanineDeaminase: document.getElementById("phenylalanineDeaminase").checked,
        gasFromDGlucose: document.getElementById("gasFromDGlucose").checked,
        lactose: document.getElementById("lactose").checked,
        sucrose: document.getElementById("sucrose").checked,
        dMannitol: document.getElementById("dMannitol").checked,
        adonitol: document.getElementById("adonitol").checked,
        inositol: document.getElementById("inositol").checked,
        dSorbitol: document.getElementById("dSorbitol").checked,
        lArabinose: document.getElementById("lArabinose").checked,
        raffinose: document.getElementById("raffinose").checked,
        lRhamnose: document.getElementById("lRhamnose").checked,
        KCN: document.getElementById("KCN").checked,
        Gelatin: document.getElementById("Gelatin").checked,
        DNAse: document.getElementById("DNAse").checked,
    };

    // Count how many tests the user has selected
    const selectedTestsCount = Object.values(inputs).filter(val => val).length;
    
    if (selectedTestsCount === 0) {
        document.getElementById("result-text").innerHTML = "Please select at least one positive test to identify bacteria.";
        return;
    }

  // Compare user inputs with profiles
  let results = [];
  for (const [bacteria, profile] of Object.entries(bacteriaProfiles)) {
      let matchScore = 0;
      let totalRelevantTests = 0;

      for (const [test, userResult] of Object.entries(inputs)) {
          // Skip if the test isn't relevant for this bacteria
          if (profile[test] === "") continue;
          
          totalRelevantTests++;
          
          // Award points for matches, penalize for mismatches
          if ((profile[test] === "+" && userResult) || (profile[test] === "-" && !userResult)) {
              matchScore++;
          }
      }

       // Only consider bacteria with at least some relevant tests
       if (totalRelevantTests > 0) {
        const matchPercentage = ((matchScore / totalRelevantTests) * 100).toFixed(2);
        results.push({ bacteria, matchPercentage, totalRelevantTests });
    }
}

    // Sort results by match percentage (highest first), then by number of relevant tests
    results.sort((a, b) => {
        if (b.matchPercentage !== a.matchPercentage) {
            return b.matchPercentage - a.matchPercentage;
        }
        return b.totalRelevantTests - a.totalRelevantTests;
    });

    // Display results with color coding
    let resultText = "";
    if (results.length === 0 || results[0].matchPercentage === "0.00") {
        resultText = "No matches found. Please check your test selections.";
    } else {
        resultText = "<h3>Top Matches:</h3><ul>";
        const topResults = results.slice(0, 5);
        
        // Find the highest percentage to normalize coloring
        const highestPercentage = parseFloat(topResults[0].matchPercentage);
        
        topResults.forEach((result) => {
            const percentage = parseFloat(result.matchPercentage);
            let colorClass = "";
            
            if (percentage > 80 || (highestPercentage <= 80 && percentage === highestPercentage)) {
                colorClass = "high-match";
            } else if (percentage > 50 || (highestPercentage <= 50 && percentage === highestPercentage)) {
                colorClass = "medium-match";
            } else {
                colorClass = "low-match";
            }
            
            resultText += `<li class="${colorClass}">${result.bacteria}: <strong>${result.matchPercentage}%</strong> match (${result.totalRelevantTests} tests considered)</li>`;
        });
        resultText += "</ul>";
    }

    document.getElementById("result-text").innerHTML = resultText;
}

// Mode switching
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.getElementById('calculator-mode').style.display = 
        btn.dataset.mode === 'calculator' ? 'block' : 'none';
      document.getElementById('quiz-mode').style.display = 
        btn.dataset.mode === 'quiz' ? 'block' : 'none';
      
      if (btn.dataset.mode === 'quiz') generateQuizQuestion();
    });
  });
  
  // Improved quiz feedback
function checkGuess() {
    const input = document.getElementById('guess-input');
    const feedback = document.getElementById('quiz-feedback');
    const correctAnswer = document.getElementById('quiz-tests').dataset.correctAnswer;
    const userGuess = input.value.trim();
    
    if (userGuess.toLowerCase() === correctAnswer.toLowerCase()) {
        feedback.innerHTML = `
            <p style="color: var(--success-color);">✅ Correct! It's ${correctAnswer}.</p>
            <div class="bacteria-info">
                <p><strong>Characteristics:</strong></p>
                <ul>
                    ${getBacteriaCharacteristics(correctAnswer)}
                </ul>
                <p>${getBacteriaInfo(correctAnswer)}</p>
            </div>
        `;
    } else {
        feedback.innerHTML = `
            <p style="color: var(--error-color);">❌ Incorrect. Your guess: ${userGuess || '[blank]'}</p>
            <p><strong>Hint:</strong> ${getBacteriaHint(correctAnswer)}</p>
            <button id="reveal-answer" class="btn small">Reveal Answer</button>
        `;
        
        document.getElementById('reveal-answer').addEventListener('click', () => {
            feedback.innerHTML += `
                <div class="correct-answer">
                    <p><strong>Correct answer:</strong> ${correctAnswer}</p>
                    <p>${getBacteriaInfo(correctAnswer)}</p>
                </div>
            `;
        });
    }
}

function getBacteriaCharacteristics(name) {
    const profile = bacteriaProfiles[name];
    if (!profile) return "";
    
    const positives = [];
    const negatives = [];
    
    for (const [test, result] of Object.entries(profile)) {
        if (result === "+") positives.push(formatTestName(test));
        else if (result === "-") negatives.push(formatTestName(test));
    }
    
    let html = "";
    if (positives.length > 0) {
        html += `<li><strong>Positive for:</strong> ${positives.join(', ')}</li>`;
    }
    if (negatives.length > 0) {
        html += `<li><strong>Negative for:</strong> ${negatives.join(', ')}</li>`;
    }
    
    return html;
}

// Add reset functionality
document.querySelector('button[type="reset"]').addEventListener('click', () => {
    document.getElementById('result-text').innerHTML = 'Select positive tests above to identify the bacteria.';
});

// Initialize quiz mode if needed
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('submit-guess').addEventListener('click', checkGuess);
    document.getElementById('new-quiz').addEventListener('click', generateQuizQuestion);
});



// Define biochemical profiles for organisms
const bacteriaProfiles = {
    "Escherichia coli": {
        indole: "+",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "-",
        h2s: "-",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "+",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "+",
        sucrose: "+",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "+",
        lRhamnose: "-",
        KCN: "-",
        Gelatin: "-",
        DNAse: "-"
    },
    "Ewingella americana": {
        indole: "-",
        methylRed: "+",
        vogesProskauer: "+",
        citrate: "+",
        h2s: "-",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "-",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "-",
        lactose: "+",
        sucrose: "-",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "-",
        lArabinose: "-",
        raffinose: "-",
        lRhamnose: "-",
        KCN: "-",
        Gelatin: "-",
        DNAse: "-"
    },
    "Hafnia alvei": {
        indole: "-",
        methylRed: "-",
        vogesProskauer: "+",
        citrate: "+",
        h2s: "-",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "+",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "-",
        sucrose: "-",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "-",
        lArabinose: "+",
        raffinose: "-",
        lRhamnose: "+",
        KCN: "+",
        Gelatin: "-",
        DNAse: "-"
    },
    "Plesiomonas shigelloides": {
        indole: "+",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "-",
        h2s: "-",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "+",
        arginineDihydrolase: "+",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "-",
        lactose: "+",
        sucrose: "-",
        dMannitol: "-",
        adonitol: "-",
        inositol: "+",
        dSorbitol: "-",
        lArabinose: "-",
        raffinose: "-",
        lRhamnose: "-",
        KCN: "-",
        Gelatin: "-",
        DNAse: "-"
    },
    "Shigella sonnei": {
        indole: "-",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "-",
        h2s: "-",
        urea: "-",
        motility: "-",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "+",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "-",
        lactose: "-",
        sucrose: "-",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "-",
        lArabinose: "+",
        raffinose: "-",
        lRhamnose: "+",
        KCN: "-",
        Gelatin: "-",
        DNAse: "-"
    },
    "Shigella except sonnei": {
        indole: "+",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "-",
        h2s: "-",
        urea: "-",
        motility: "-",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "+",
        ornithineDecarboxylase: "-",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "-",
        lactose: "-",
        sucrose: "-",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "+",
        lRhamnose: "-",
        KCN: "-",
        Gelatin: "-",
        DNAse: "-"
    },
    "Salmonella enteritidis": {
        indole: "-",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "+",
        h2s: "+",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "+",
        arginineDihydrolase: "+",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "-",
        sucrose: "-",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "-",
        lRhamnose: "+",
        KCN: "-",
        Gelatin: "-",
        DNAse: "-"
    },
    "Salmonella typhi": {
        indole: "-",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "-",
        h2s: "+",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "+",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "-",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "-",
        lactose: "-",
        sucrose: "-",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "+",
        lArabinose: "-",
        raffinose: "-",
        lRhamnose: "-",
        KCN: "-",
        Gelatin: "-",
        DNAse: "-"
    },
    "Edwardsiella tarda": {
        indole: "+",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "-",
        h2s: "+",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "+",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "-",
        sucrose: "-",
        dMannitol: "-",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "-",
        lArabinose: "-",
        raffinose: "-",
        lRhamnose: "-",
        KCN: "-",
        Gelatin: "-",
        DNAse: "-"
    },
    "Citrobacter freundii": {
        indole: "-",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "+",
        h2s: "+",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "+",
        ornithineDecarboxylase: "-",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "+",
        sucrose: "+",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "-",
        lRhamnose: "+",
        KCN: "+",
        Gelatin: "-",
        DNAse: "-"
    },
    "Citrobacter braakii": {
        indole: "-",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "+",
        h2s: "+",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "+",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "+",
        sucrose: "-",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "-",
        lRhamnose: "+",
        KCN: "+",
        Gelatin: "-",
        DNAse: "-"
    },
    "Citrobacter koseri": {
        indole: "+",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "+",
        h2s: "-",
        urea: "+",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "+",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "+",
        sucrose: "-",
        dMannitol: "+",
        adonitol: "+",
        inositol: "-",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "-",
        lRhamnose: "+",
        KCN: "-",
        Gelatin: "-",
        DNAse: "-"
    },
    "Klebsiella pneumoniae": {
        indole: "-",
        methylRed: "+",
        vogesProskauer: "+",
        citrate: "+",
        h2s: "-",
        urea: "+",
        motility: "-",
        lysineDecarboxylase: "+",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "-",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "+",
        sucrose: "+",
        dMannitol: "+",
        adonitol: "+",
        inositol: "+",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "+",
        lRhamnose: "+",
        KCN: "+",
        Gelatin: "-",
        DNAse: "-"
    },
    "Klebsiella oxytoca": {
        indole: "+",
        methylRed: "-",
        vogesProskauer: "+",
        citrate: "+",
        h2s: "-",
        urea: "+",
        motility: "-",
        lysineDecarboxylase: "+",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "-",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "+",
        sucrose: "+",
        dMannitol: "+",
        adonitol: "+",
        inositol: "+",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "+",
        lRhamnose: "+",
        KCN: "+",
        Gelatin: "-",
        DNAse: "-"
    },
    "Enterobacter cloacae": {
        indole: "-",
        methylRed: "-",
        vogesProskauer: "+",
        citrate: "+",
        h2s: "-",
        urea: "+",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "+",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "+",
        sucrose: "+",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "+",
        lRhamnose: "+",
        KCN: "+",
        Gelatin: "-",
        DNAse: "-"
    },
    "Enterobacter aerogenes": {
        indole: "-",
        methylRed: "-",
        vogesProskauer: "+",
        citrate: "+",
        h2s: "-",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "+",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "+",
        sucrose: "+",
        dMannitol: "+",
        adonitol: "+",
        inositol: "+",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "+",
        lRhamnose: "+",
        KCN: "+",
        Gelatin: "+",
        DNAse: "-"
    },
    "Cronobacter sakazakii": {
        indole: "-",
        methylRed: "-",
        vogesProskauer: "+",
        citrate: "+",
        h2s: "-",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "+",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "+",
        lactose: "+",
        sucrose: "+",
        dMannitol: "+",
        adonitol: "-",
        inositol: "+",
        dSorbitol: "-",
        lArabinose: "+",
        raffinose: "+",
        lRhamnose: "+",
        KCN: "+",
        Gelatin: "-",
        DNAse: "-"
    },
    "Pantoea agglomerans": {
        indole: "-",
        methylRed: "+",
        vogesProskauer: "+",
        citrate: "+",
        h2s: "-",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "-",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "-",
        lactose: "-",
        sucrose: "+",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "-",
        lArabinose: "+",
        raffinose: "-",
        lRhamnose: "+",
        KCN: "-",
        Gelatin: "-",
        DNAse: "-"
    },
    "Serratia marcescens": {
        indole: "-",
        methylRed: "+",
        vogesProskauer: "+",
        citrate: "+",
        h2s: "-",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "+",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "-",
        lactose: "-",
        sucrose: "+",
        dMannitol: "+",
        adonitol: "-",
        inositol: "+",
        dSorbitol: "+",
        lArabinose: "-",
        raffinose: "-",
        lRhamnose: "-",
        KCN: "+",
        Gelatin: "-",
        DNAse: "-"
    },
    "Serratia odorifera": {
        indole: "+",
        methylRed: "+",
        vogesProskauer: "+",
        citrate: "+",
        h2s: "-",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "+",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "-",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "-",
        lactose: "+",
        sucrose: "-",
        dMannitol: "+",
        adonitol: "+",
        inositol: "+",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "-",
        lRhamnose: "+",
        KCN: "-",
        Gelatin: "+",
        DNAse: "-"
    },
    "Proteus vulgaris": {
        indole: "+",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "-",
        h2s: "+",
        urea: "+",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "-",
        phenylalanineDeaminase: "+",
        gasFromDGlucose: "+",
        lactose: "-",
        sucrose: "+",
        dMannitol: "-",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "-",
        lArabinose: "-",
        raffinose: "-",
        lRhamnose: "-",
        KCN: "+",
        Gelatin: "+",
        DNAse: "-"
    },
    "Proteus mirabilis": {
        indole: "-",
        methylRed: "+",
        vogesProskauer: "+",
        citrate: "+",
        h2s: "+",
        urea: "+",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "+",
        gasFromDGlucose: "+",
        lactose: "-",
        sucrose: "-",
        dMannitol: "-",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "-",
        lArabinose: "-",
        raffinose: "-",
        lRhamnose: "-",
        KCN: "+",
        Gelatin: "+",
        DNAse: "-"
    },
    "Morganella morganii": {
        indole: "+",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "-",
        h2s: "-",
        urea: "+",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "+",
        gasFromDGlucose: "-",
        lactose: "-",
        sucrose: "-",
        dMannitol: "-",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "-",
        lArabinose: "-",
        raffinose: "-",
        lRhamnose: "-",
        KCN: "+",
        Gelatin: "-",
        DNAse: "-"
    },
    "Providencia rettgeri": {
        indole: "+",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "+",
        h2s: "-",
        urea: "+",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "-",
        phenylalanineDeaminase: "+",
        gasFromDGlucose: "-",
        lactose: "-",
        sucrose: "-",
        dMannitol: "+",
        adonitol: "+",
        inositol: "+",
        dSorbitol: "-",
        lArabinose: "-",
        raffinose: "-",
        lRhamnose: "+",
        KCN: "+",
        Gelatin: "-",
        DNAse: "-"
    },
    "Providencia stuartii": {
        indole: "+",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "+",
        h2s: "-",
        urea: "-",
        motility: "+",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "-",
        phenylalanineDeaminase: "+",
        gasFromDGlucose: "-",
        lactose: "-",
        sucrose: "+",
        dMannitol: "-",
        adonitol: "-",
        inositol: "+",
        dSorbitol: "-",
        lArabinose: "-",
        raffinose: "-",
        lRhamnose: "-",
        KCN: "+",
        Gelatin: "-",
        DNAse: "-"
    },
    "Yersinia enterocolitica": {
        indole: "+",
        methylRed: "+",
        vogesProskauer: "-",
        citrate: "-",
        h2s: "-",
        urea: "+",
        motility: "-",
        lysineDecarboxylase: "-",
        arginineDihydrolase: "-",
        ornithineDecarboxylase: "+",
        phenylalanineDeaminase: "-",
        gasFromDGlucose: "-",
        lactose: "-",
        sucrose: "+",
        dMannitol: "+",
        adonitol: "-",
        inositol: "-",
        dSorbitol: "+",
        lArabinose: "+",
        raffinose: "-",
        lRhamnose: "-",
        KCN: "-",
        Gelatin: "-",
        DNAse: "-"
    },

};