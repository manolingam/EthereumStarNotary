const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 

    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: accounts[0]})
    })
    
    describe('can create a star', () => { 

        it('can create a star and get its name', async function () { 
            await this.contract.createStar('00h41m10.56s', `+41Â°24'41.9"`, 15.15, "First Star", 1, {from: accounts[0]})
            let starArray = await this.contract.tokenIdToStarInfo(1);
            assert.equal(starArray[0], '00h41m10.56s')
        })
    })

    describe('buying and selling stars', () => { 
        let user1 = accounts[1]
        let user2 = accounts[2]
        let randomMaliciousUser = accounts[3]
        
        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () { 
            await this.contract.createStar('00h41m10.56s', `+41Â°24'41.9"`, 15.15, "First Star", starId, {from: user1})    
        })

        it('user1 can put up their star for sale', async function () { 
            assert.equal(await this.contract.ownerOf(starId), user1)
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            
            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => { 
            beforeEach(async function () { 
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() { 
                await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () { 
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })

    describe('Additional functions', () => {

        let user2 = accounts[1];

        beforeEach(async function () { 
            await this.contract.createStar('00h41m10.56s', `+41Â°24'41.9"`, 15.15, "First Star", 1, {from: accounts[0]})    
        })

        it('can check if a star exists', async function () {
            assert.equal(await this.contract.checkIfStarExists("01h41m10.56s"), false);
        })

        it('can approve another address', async function () {
            await this.contract.Approve(user2, 1);
            assert.equal(await this.contract.getApproved(1), user2);
        })

        it('can safely transfer token', async function () {
            await this.contract.SafeTransferFrom(user2, 1);
            assert.equal(await this.contract.ownerOf(1), user2);
        })

        it('can set approval for all', async function () {
            await this.contract.SetApprovalForAll(user2, true);
            assert.equal(await this.contract.isApprovedForAll(accounts[0], user2), true);
        })

        it('can get approved', async function () {
            await this.contract.GetApproved(1);
            assert.equal(await this.contract.ownerOf(1), accounts[0]);
        })

        it('can check whether an operator is approved', async function () {
            await this.contract.IsApprovedForAll(user2);
            assert.equal(await this.contract.isApprovedForAll(accounts[0], user2), false);
        })

        it('can check the owner of a token', async function () {
            await this.contract.OwnerOf(1);
            assert.equal(await this.contract.ownerOf(1), accounts[0]);
        })

        it('can check the stars put up for sale', async function () {
            await this.contract.StarsForSale();
            assert.equal(await this.contract.starsInSale.length, 0);
        })

        it('can check the starInfo of token', async function () {
            let resArray = await this.contract.TokenIdToStarInfo(1);
            assert.equal(resArray[0], '00h41m10.56s');
            assert.equal(resArray[3], 'First Star');
        })
    })
})