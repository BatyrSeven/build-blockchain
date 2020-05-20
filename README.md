# build-blockchain

This project is created for tracking my own edicatoinal process in a building a blockchain project.

Link to the course on Udemy: https://www.udemy.com/course/build-blockchain-full-stack/

### Architectural pattern
The Publisher-Subscriber paradigm is followed for passing messages between peers - an updated chain with a newly added block is broadcasted over the network. There are several channels to which any peer can subscribe. They are `BLOCKCHAIN` (for broadcasting updated chain), `TRANSACTION` (for broadcasring new transactions), and `TEST` (for testing purposes only).

### The development approach

Test-Driven Development (TDD) is followed to keep the reliability and robustness during the whole period of the development.

### Available npm commands

* `npm run test` - run all tests with Jest and keep wathcing on new changes
* `npm run start` - run the server on `nodemon`
* `npm run dev` - run the dev instance on `localhost:3000`
* `npm run dev-peer` - run the dev instance on random port