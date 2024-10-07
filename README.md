# Memory Management Simulator

This simulator helps computer science students and enthusiasts understand memory allocation visually and interactively.
![Alt text](https://i.imgur.com/5CY5NB6.png)

## Features

- **User Input for Processes**: Users can add processes by specifying memory size and duration.
- **Best-Fit Allocation**: Allocates memory using the *Best-Fit* strategy, minimizing fragmentation.
- **Dynamic Partitioning**: Memory blocks are split as needed for optimal use.
- **Simulated Clock**: Background clock manages each process's lifetime, freeing memory when done.
- **Doubly Linked List Representation**: Memory is managed with a doubly linked list for efficient operations.
- **Compaction**: Merges free blocks into one to reduce fragmentation.

## Technologies Used

- **JavaScript**: Core logic for memory management.
- **HTML/CSS**: Front-end for visualizing memory allocation.

## How It Works

1. **Process Creation**: Users create processes with a specified size and duration.
2. **Memory Blocks**: Memory is divided into blocks (`MemControlBlock`), which can be allocated or partitioned.
3. **Allocation Algorithm**: Uses *Best-Fit* to allocate the smallest block that fits a process.
4. **Simulated Clock**: Manages process duration and frees memory when time expires.
5. **Compaction**: Option to merge all free blocks into one to reduce fragmentation.

## Key Components

- **Process Class**: Represents processes needing memory.
- **MemControlBlock Class**: Represents memory blocks, linked in a doubly linked list.
- **Heap Class**: Manages memory allocation, deallocation, and compaction.
- **Front-End Interaction**: Users interact through a form, with visual updates showing block availability.

## Running the Simulation

1. Open the HTML file in a web browser.
2. Use the form to add processes by specifying size and duration.
3. Observe memory allocation, deallocation, and compaction.
4. Use checkboxes to enable *First-Fit*, *Fragmentation Display*, or *Compaction*.

## Educational Value

- **Fragmentation**: Visualize internal and external fragmentation challenges.
- **Best-Fit Strategy**: Learn about advantages and limitations of Best-Fit.
- **Compaction**: See how compaction helps reduce fragmentation.

## Future Enhancements

- **More Allocation Strategies**: Add *First-Fit* and *Worst-Fit* for comparison.
- **Improved Visualization**: Add animations or detailed memory usage graphs.
- **Metrics**: Show memory utilization and average wait time for better insights.
