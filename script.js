// Constructor for Process class
// Represents a process that requires memory allocation, with a specified size and lifetime.
// Properties:
// - size: Size of the process in memory units.
// - timeLeft: The amount of time remaining for this process.
// - allocatedBlock: Memory block allocated to this process.
// - id: Unique identifier for the process.
function Process(size, time) {
	this.size = size;
	this.timeLeft = time;
	this.allocatedBlock = null;
	this.id = processID;

	processID += 1;

	// Check if the process is allocated
	this.isAllocated = function() {
		return this.allocatedBlock != null;
	};

	// Decrement the time left for the process
	this.tick = function() {
		this.timeLeft -=1;
	};
}

// Constructor for Memory Control Block (MemControlBlock)
// Represents a block of memory, which can either be available or allocated to a process.
// Properties:
// - size: Size of the memory block.
// - process: Process allocated to this block (null if available).
// - available: Boolean indicating whether the block is available.
// - next: Reference to the next block in the memory.
// - prev: Reference to the previous block in the memory.
// - fromPartition: Boolean indicating whether the block was created by partitioning.
function MemControlBlock(size) {
	this.size = size;
	this.process = null;
	this.available = true;
	this.next = null;
	this.prev = null;
	this.fromPartition = false; // Used to determine whether height of a MemControlBlock needs to be added

	// Set a process to the memory control block
	this.setProcess = function(process) {
		if (process == null) {
			this.process = null;
			this.available = true;
		} else {
			this.process = process;
			this.available = false;
		}
	}
}

// Constructor for Heap
// Represents the memory heap that manages memory blocks and allocates them to processes.
// Methods:
// - requestAllocation: Allocates a process to memory using best-fit or first-fit method.
// - findInitialValidBlock: Finds the first valid memory block that can accommodate the process.
// - findBestFitBlock: Finds the best-fit memory block for the process.
// - allocateBlock: Allocates a memory block to a process, with fragmentation considerations.
// - partitionBlockIfNeeded: Partitions a memory block if there is extra space left after allocation.
// - deallocateProcess: Deallocates a memory block from a process.
// - add: Adds a new memory block to the heap.
// - getExternalFragmentation: Calculates the amount of external fragmentation in the heap.
// - compact: Compacts available blocks into a single block to reduce fragmentation.
// - toString: Returns a string representation of the heap.
// - repaint: Updates the visual representation of the heap on the front-end.
function Heap() {
	this.head = null;
	this.size = 0;

	// Allocate process to memory using best-fit or first-fit method
	this.requestAllocation = function(process, firstFit, fragmentation) {
		let blockBestFit = this.findInitialValidBlock(process);
		if (!blockBestFit) return false;

		if (!firstFit) {
			blockBestFit = this.findBestFitBlock(blockBestFit, process);
		}

		this.allocateBlock(blockBestFit, process, fragmentation);
		document.getElementById("externalFragmentation").innerHTML = this.getExternalFragmentation();
		return true;
	};

	// Find the initial valid block for allocation
	// Traverses the memory linked list to find the first block that can fit the process.
	this.findInitialValidBlock = function(process) {
		let block = this.head;
		while (block && ((block.size < process.size) || !block.available)) {
			block = block.next;
		}
		return block;
	};

	// Find the best-fit block for allocation
	// Finds the smallest available block that can fit the process.
	this.findBestFitBlock = function(blockBestFit, process) {
		let block = blockBestFit.next;
		while (block != null) {
			if ((block.size >= process.size) && (block.available) && (block.size < blockBestFit.size)) {
				blockBestFit = block;
			}
			block = block.next;
		}
		return blockBestFit;
	};

	// Allocate a block to a process
	// Allocates the process to the selected memory block and manages fragmentation.
	this.allocateBlock = function(blockBestFit, process, fragmentation) {
		let spaceLeftover = blockBestFit.size - (process.size + memControlBlockSize);
		if (!fragmentation) {
			this.partitionBlockIfNeeded(blockBestFit, spaceLeftover);
		} else {
			document.getElementById("internalFragmentation").innerHTML = spaceLeftover + parseInt(document.getElementById("internalFragmentation").innerHTML);
		}
		blockBestFit.setProcess(process);
		process.allocatedBlock = blockBestFit;
	};

	// Partition block if needed
	// Partitions the block if there is extra space left after allocating a process.
	this.partitionBlockIfNeeded = function(blockBestFit, spaceLeftover) {
		if (spaceLeftover > 0) {
			let newBlock = new MemControlBlock(spaceLeftover);
			let nextBlock = blockBestFit.next;
			if (nextBlock != null) {
				nextBlock.prev = newBlock;
				newBlock.next = nextBlock;
			}
			blockBestFit.next = newBlock;
			newBlock.prev = blockBestFit;
			blockBestFit.size = process.size;
			newBlock.fromPartition = true;
		}
	};

	// Deallocate the process from memory
	// Releases the memory block allocated to the process and updates fragmentation metrics.
	this.deallocateProcess = function(process) {
		document.getElementById("internalFragmentation").innerHTML = parseInt(document.getElementById("internalFragmentation").innerHTML) - process.allocatedBlock.size + process.size;
		process.allocatedBlock.setProcess(null);
		process.allocatedBlock = null;
		document.getElementById("externalFragmentation").innerHTML = this.getExternalFragmentation();
	};

	// Add a block to the heap
	// Adds a new memory block to the start of the linked list representing the heap.
	this.add = function(block) {
		if (this.head == null) {
			this.head = block;
		} else {
			block.next = this.head;
			this.head.prev = block;
			this.head = block;
		}
		this.size += block.size;
	};

	// Calculate external fragmentation
	// Calculates the total size of available blocks (external fragmentation).
	this.getExternalFragmentation = function() {
		let block = this.head;
		let space = 0;
		while (block != null) {
			if (block.available) {
				space += block.size;
			}
			block = block.next;
		}
		return space;
	};

	// Compact available blocks into a single block
	// Merges all available blocks into one to reduce fragmentation.
	this.compact = function() {
		let block = this.head;
		let space = 0;
		while (block != null) {
			if (block.available) {
				space += block.size;
				this.size -= block.size;
				//ignore type coercion
				if (block == this.head) {
					this.head = block.next;
				} else {
					block.prev.next = block.next;
					if (block.next) {
						block.next.prev = block.prev;
					}
				}
			}
			block = block.next;
		}
		this.add(new MemControlBlock(space));
	};

	// Return a string representation of the heap
	// Returns a formatted string representing the current state of memory blocks in the heap.
	this.toString = function() {
		let string = "[|";
		let block = this.head;
		let prefix = "";
		let suffix = "</span> |";
		while (block != null) {
			if (block.available) {
				prefix = "<span style='color: #01DF01;'> ";
			} else {
				prefix = "<span style='color: #FF0000;'> ";
			}
			string += (prefix + block.size + suffix);
			block = block.next;
		}
		string += "]";
		return string;
	};

	// Repaint the heap representation on the front-end
	// Updates the visual representation of memory blocks on the front-end UI.
	this.repaint = function() {
		let block = this.head;
		memoryDiv.innerHTML = "";
		while (block != null) {
			let height = ((block.size/this.size)*100);
			if (block.fromPartition) {
				height += (memControlBlockSize/this.size)*100;
			}
			let divBlock = document.createElement("div");
			divBlock.style.height = (height + "%");
			divBlock.setAttribute("id", "block");
			if (block.available) {
				divBlock.className = "available";
			} else {
				divBlock.className = "unavailable";
			}
			memoryDiv.appendChild(divBlock);

			let blockLabel = document.createElement("div");
			blockLabel.setAttribute("id", "blockLabel");
			blockLabel.style.height = (height + "%");
			blockLabel.innerHTML = block.size + "K";
			if (block.process != null && height > 10) {
				blockLabel.innerHTML += "<br />Process ID: "+ block.process.id;
			}
			if (height <= 2) {
				blockLabel.style.display = "none";
			}
			divBlock.appendChild(blockLabel);
			block = block.next;
		}
	}
}

// Handle front-end process submission
// Handles the form submission to create a new process, allocate it to memory, and update the front-end UI.
document.getElementById("processForm").onsubmit = function () {
	let elements = this.elements;
	let inProcessSize = elements.namedItem("processSize");
	let inProcessTime = elements.namedItem("processTime");
	let process = new Process(parseInt(inProcessSize.value), parseInt(inProcessTime.value));
	processes.push(process);
	addProcessToTable(process);
	log("Requesting: " + process.size);
	log(heap.toString() + "<br>");
	inProcessSize.value = "";
	inProcessTime.value = "";
	return false;
};

// Utility functions for logging, updating table, and removing process from table
// Logs a message to the logBox element on the front-end.
function log(string) {
	logBox.innerHTML += (string + "<br />");
}

// Adds a process to the process table on the front-end.
function addProcessToTable(process) {
	let row = document.createElement("tr");
	row.setAttribute("id", "process" + process.id);
	let colName = document.createElement("td");
	colName.innerHTML = process.id;
	let colSize = document.createElement("td");
	colSize.innerHTML = process.size;
	let colTime = document.createElement("td");
	colTime.setAttribute("id", "process" + process.id + "timeLeft");
	colTime.innerHTML = process.timeLeft;
	row.appendChild(colName);
	row.appendChild(colSize);
	row.appendChild(colTime);
	processTable.appendChild(row);
}

// Removes a process from the process table on the front-end.
function removeProcessFromTable(process) {
	processTable.removeChild(document.getElementById("process" + process.id));
}

// Refreshes the process table to update the time left for each process.
function refreshTable() {
	for (let i = 0; i < processes.length; i++) {
		let process = processes[i];
		document.getElementById("process" + process.id + "timeLeft").innerHTML = process.timeLeft;
	}
}

// Initialization of variables
// Sets up initial state, adds memory blocks to the heap, and starts the memory management simulation.
let logBox = document.getElementById("logBox");
let memoryDiv = document.getElementById("memory");
let processTable = document.getElementById("processTable");
let memControlBlockSize = 0;
let processID = 1;
let processes = [];
let heap = new Heap();
let blockSizes = [450,150,70,50,300,200];
let compaction = false;
let firstFit = false;
let fragmentation = false;

// Add blocks to the heap
for (let i = 0; i < blockSizes.length; i++) {
	heap.add(new MemControlBlock(blockSizes[i]));
}

// Draw initial heap
heap.repaint();

// Start clock to simulate memory allocation and deallocation over time
let clock = setInterval(function() {
	for (let i = 0; i < processes.length; i++) {
		let process = processes[i];
		if (!process.isAllocated()) {
			if (!heap.requestAllocation(process, firstFit, fragmentation)) {
				if (compaction) {
					heap.compact();
				}
			}
			document.getElementById("ProcessSize").focus();
		} else {
			process.tick();
			if (process.timeLeft < 1) {
				heap.deallocateProcess(process);
				let index = processes.indexOf(process);
				if (index > -1) {
					processes.splice(index, 1);
				}
				removeProcessFromTable(process);
			}
		}
	}
	firstFit = document.getElementById("firstFit").checked;
	fragmentation = document.getElementById("fragmentation").checked;
	compaction = document.getElementById("compaction").checked;
	refreshTable();
	heap.repaint();
}, 1000);