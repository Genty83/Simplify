import { suiSheet } from "@simplify/engine";

const grid = suiSheet({
  usingBreakpoints: ["mobile", "tablet"],

  layout: {
    display: "grid"
  }
})

function App() {


  return (
    <div className={ grid }>
      Simplify Playground
    </div>
  )
}

export default App
