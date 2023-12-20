//  IMPORTS
    import Text "mo:base/Text";
    import Time "mo:base/Time";
    import Buffer "mo:base/Buffer";
    import Debug "mo:base/Debug";
    import Result "mo:base/Result";

//  tasks
    actor class tasks() {


//  The task object
	public type tasks = {
		title : Text;
		description : Text;
		dueDate : Time.Time; //In some cases is needed write the import in this formar
		completed : Bool;
		};

    //NOTE: Im using task, taskId, newTask and markedTask for have control of tasks

//  Create the task buffer
    let tasksBuffer = Buffer.Buffer<tasks>(0);

//  METHODS

//  ADD a task
	public shared func addTasks(task : tasks) : async Nat {
		tasksBuffer.add(task);
        return (tasksBuffer.size() - 1); //array.size need be 0
        };

//  UPDATE/EDIT a task by ID
		public shared func updateTasks(taskId : Nat, newTask : tasks) : async Result.Result<(), Text> {
        if (tasksBuffer.size() <= taskId) {
        return #err "The requested taskId is higher";
        };
        tasksBuffer.put(taskId, newTask);
        return #ok();
        };

//  MARK AS COMPLETED a task by ID
		public shared func markAsCompleted(taskId : Nat) : async Result.Result<(), Text> {
        if (tasksBuffer.size() <= taskId) {
        return #err "The requested taskId is higher";
        };
        var task : tasks = tasksBuffer.get(taskId);
        var markedTask : tasks = {
        title = task.title;
        description = task.description;
        dueDate = task.dueDate;
        completed = true;
        };
        tasksBuffer.put(taskId, markedTask);
        return #ok();
        };

//  MARK AS PENDING a task by ID
		public shared func markAsPending(taskId : Nat) : async Result.Result<(), Text> {
        if (tasksBuffer.size() <= taskId) {
        return #err "The requested taskId is higher";
        };
        var task : tasks = tasksBuffer.get(taskId);
        var markedTask : tasks = {
        title = task.title;
        description = task.description;
        dueDate = task.dueDate;
        completed = false;
        };
        tasksBuffer.put(taskId, markedTask);
        return #ok();
        };

//  DELETE a task by ID
	public shared func deleteTasks(taskId : Nat) : async Result.Result<(), Text> {
        if (tasksBuffer.size() <= taskId) {
        return #err "The requested taskId is higher";
		};
		let x = tasksBuffer.remove(taskId);
		return #ok();
		};

//  GET a task by ID
	public shared func getTasks(taskId : Nat) : async Result.Result<tasks, Text> {
		if (tasksBuffer.size() <= taskId) {
		return #err "The tasks Buffer is full";
		};
		let task = tasksBuffer.get(taskId);
		return #ok task;
		};

//  GET ALL tasks
	public shared func getAllTasks() : async [tasks] {
		return Buffer.toArray<tasks>(tasksBuffer);
		};

//  GET ONLY PENDING tasks
	public shared func getPendingtasks() : async [tasks] {
		var pending = Buffer.clone(tasksBuffer);
		pending.filterEntries(func(_, task) = task.completed == false);
		return Buffer.toArray<tasks>(pending);
		};

//  SEARCH tasks by TEXT
	public shared func searchTasks(searchTerm : Text) : async [tasks] {
		var search = Buffer.clone(tasksBuffer);
		search.filterEntries(func(_, task) = Text.contains(task.title, #text searchTerm) or Text.contains(task.description, #text searchTerm));
		return Buffer.toArray<tasks>(search);
		}; 
}; 