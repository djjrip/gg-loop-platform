// BINARY ISOLATION TEST - BOTTOM HALF DISABLED
// Lines 2500-4384 temporarily commented out to locate corruption

if (challengeData.totalBudget > availableBudget) {
    return res.status(400).json({
        message: `Insufficient sponsor budget. Available: ${availableBudget} pts (Total: ${sponsor.totalBudget}, Spent: ${sponsor.spentBudget}, Reserved: ${reservedBudget}), Required: ${challengeData.totalBudget} pts`
    });
}
          }

// BINARY ISOLATION: Rest of file temporarily disabled
// TODO: Re-enable after finding corruption

return createServer(app);
        }
      }
