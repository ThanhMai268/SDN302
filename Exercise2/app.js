import TodoList from "./todoList.js";
import TodoItem from "./todoItem.js";
import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

const todoList = new TodoList();

async function addNewItem() {
    const title = await askQuestion("Enter the title of the new todo item: ");
    const item = new TodoItem(title);
    todoList.addItem(item);
    console.log("Add new item successfully \n");
}

async function markItemCompleted() {
    const index = await askQuestion("Enter the index of the item to mark as completed: ");
    const indexInt = parseInt(index, 10) - 1;
    if (indexInt >= 0 && indexInt < todoList.items.length) {
        todoList.completeItem(indexInt);
        console.log("Mark item as completed successfully \n");
    }
    else {
        console.log("Invalid index \n");
    }

}

async function main() {
    let running = true;
    while (running) {
        console.log("1. Add new item \n");
        console.log("2. Mark item as completed \n");
        console.log("3. Display all item \n");
        console.log("4. Exit \n");
        const choice = await askQuestion("Enter your choice: ");

        switch (choice) {
            case '1':
                await addNewItem();
                break;
            case '2':
                await markItemCompleted();
                break;
            case '3':
                todoList.displayItemsWithStatus();
                break;
            case '4':
                running = false;
                break;
            default:
                console.log("Invalid choice \n");
        }
    }
    rl.close();
}

main().catch(err => console.error(err));
