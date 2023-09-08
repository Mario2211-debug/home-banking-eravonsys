import { Request, ResponseToolkit } from '@hapi/hapi';
import { db } from '../database';
import { addValues, setDecimalPlaces } from '../utils';
import { InternalMovement } from '../model/internalMovement';
import { Payment } from '../model/payment';
import { updateMovementList, updateSubscriptionStatus, updateWallet } from './bankUtils';
import { Transfer } from '../model/transfer';
import { json } from 'stream/consumers';
import { Subscribed } from '../model/subscribe';

/**
 * <p>Route | GET:funds</p>
 * <p>Gets user's wallet</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'wallet' property
 */
export async function getFunds(request: Request, h: ResponseToolkit) {
    const userId = request.auth.credentials.userId; //UserID from JWT token
    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }

    const wallet = db.data.wallets.find((wallet) => wallet.userId === userId);
    if (!wallet) {
        return h.response({ feedback: 'Wallet not found' }).code(404);
    }

    return h.response({ feedback: 'Wallet found', wallet: wallet }).code(200);
}

/**
 * <p>Route | PUT:funds</p>
 * <p>Adds funds to user's wallet</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'funds' property with the new wallet funds
 */
export async function addFunds(request: Request, h: ResponseToolkit) {
    const userId = request.auth.credentials.userId; //UserID from JWT token
    const transactionValue = setDecimalPlaces((<any>request.payload).funds);
    if (
        parseFloat(transactionValue) <= 0 ||
        isNaN(parseFloat(transactionValue))
    ) {
        return h.response({ feedback: 'Invalid transaction value' }).code(400);
    }

    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }

    const wallet = db.data.wallets.find((wallet) => wallet.userId === userId);
    if (!wallet) {
        return h.response({ feedback: 'Wallet not found' }).code(404);
    }
    wallet.funds = addValues(wallet.funds, transactionValue);
    const walletMovementList = db.data.movementLists.find(
        (list) => list.walletId === wallet.id
    );
    if (!walletMovementList) {
        return h.response({ feedback: 'Movement list not found' }).code(404);
    }
    walletMovementList.internalMovements.unshift(
        new InternalMovement(transactionValue, wallet.funds, 'Deposited funds')
    );

    updateWallet(wallet);
    updateMovementList(walletMovementList);

    await db.write(); //Required to write to database

    return h
        .response({ feedback: 'Added funds', funds: wallet.funds })
        .code(200);
}

/**
 * <p>Route | DELETE:funds?{funds}</p>
 * <p>Removes funds to user's wallet</p>
 * <p>User is identified using JWT token credentials and value is passed as route query</p>
 *
 * @returns 'feedback' property and, if successful, 'funds' property with the new wallet funds
 */
export async function removeFunds(request: Request, h: ResponseToolkit) {
    const userId = <string>request.auth.credentials.userId; //UserID from JWT token
    const transactionValue = setDecimalPlaces((<any>request.query).funds);
    if (
        parseFloat(transactionValue) <= 0 ||
        isNaN(parseFloat(transactionValue))
    ) {
        return h.response({ feedback: 'Invalid transaction value' }).code(400);
    }

    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }
    const wallet = db.data.wallets.find((wallet) => wallet.userId === userId);
    if (!wallet) {
        return h.response({ feedback: 'Wallet not found' }).code(404);
    }

    wallet.funds = addValues(wallet.funds, -transactionValue);
    if (parseFloat(wallet.funds) < 0) {
        return h.response({ feedback: 'Not enough funds' }).code(401);
    }
    const walletMovementList = db.data.movementLists.find(
        (list) => list.walletId === wallet.id
    );
    if (!walletMovementList) {
        return h.response({ feedback: 'Movement list not found' }).code(404);
    }
    walletMovementList.internalMovements.unshift(
        new InternalMovement(
            setDecimalPlaces('-' + transactionValue),
            wallet.funds,
            'Withdrew funds'
        )
    );

    updateWallet(wallet);
    updateMovementList(walletMovementList);

    await db.write(); //Required to write to database

    return h
        .response({ feedback: 'Removed funds', funds: wallet.funds })
        .code(200);
}

/**
 * <p>Route | GET:movements</p>
 * <p>Gets all of user's movements, this includes internal movements, transfers and payments</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'movementList' property with the movement list
 */
export async function getMovements(request: Request, h: ResponseToolkit) {
    const userId = <string>request.auth.credentials.userId; //UserID from JWT token

    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }

    const wallet = db.data.wallets.find((wallet) => wallet.userId === userId);
    if (!wallet) {
        return h.response({ feedback: 'Wallet not found' }).code(404);
    }
    const movementList = db.data.movementLists.find(
        (list) => list.walletId === wallet.id
    );
    if (!movementList) {
        return h.response({ feedback: 'Movement list not found' }).code(404);
    }

    return h
        .response({
            feedback: 'Movement list found',
            movementList: movementList,
        })
        .code(200);
}

/**
 * <p>Route | GET:internalMovements</p>
 * <p>Gets all of user's internal movements</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'internalMovements' property with the internal movements
 */
export async function getInternalMovements(
    request: Request,
    h: ResponseToolkit
) {
    const userId = <string>request.auth.credentials.userId; //UserID from JWT token

    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }

    const wallet = db.data.wallets.find((wallet) => wallet.userId === userId);
    if (!wallet) {
        return h.response({ feedback: 'Wallet not found' }).code(404);
    }
    const movementList = db.data.movementLists.find(
        (list) => list.walletId === wallet.id
    );
    if (!movementList) {
        return h.response({ feedback: 'Movement list not found' }).code(404);
    }
    return h
        .response({
            feedback: 'Internal movements found',
            internalMovements: movementList.internalMovements,
        })
        .code(200);
}

/**
 * <p>Route | GET:transfers</p>
 * <p>Gets all of user's transfers</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'transfers' property with the transfers
 */
export async function getTransfers(request: Request, h: ResponseToolkit) {
    const userId = <string>request.auth.credentials.userId; //UserID from JWT token

    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }

    const wallet = db.data.wallets.find((wallet) => wallet.userId === userId);
    if (!wallet) {
        return h.response({ feedback: 'Wallet not found' }).code(404);
    }
    const movementList = db.data.movementLists.find(
        (list) => list.walletId === wallet.id
    );
    if (!movementList) {
        return h.response({ feedback: 'Movement list not found' }).code(404);
    }

    return h
        .response({
            feedback: 'Transfers found',
            transfers: movementList.transfers,
        })
        .code(200);
}

/**
 * <p>Route | GET:payments</p>
 * <p>Gets all of user's payments</p>
 * <p>User is identified using JWT token credentials</p>
 *
 * @returns 'feedback' property and, if successful, 'payments' property with the payments
 */
export async function getPayments(request: Request, h: ResponseToolkit) {
    const userId = <string>request.auth.credentials.userId; //UserID from JWT token

    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }

    const wallet = db.data.wallets.find((wallet) => wallet.userId === userId);
    if (!wallet) {
        return h.response({ feedback: 'Wallet not found' }).code(404);
    }
    const movementList = db.data.movementLists.find(
        (list) => list.walletId === wallet.id
    );
    if (!movementList) {
        return h.response({ feedback: 'Movement list not found' }).code(404);
    }

    return h
        .response({
            feedback: 'Payments found',
            payments: movementList.payments,
        })
        .code(200);
}

/**
 * <p>Route | POST:payments</p>
 * <p>Processes new payment</p>
 * <p>User is identified using JWT token credentials</p>
 * <p>Payload required: entity (string), reference (string), transactionValue (string|number)</>
 * <p>Payload optional: description (string)
 *
 * @returns 'feedback' property and, if successful, 'payment' property with the new payment
 */
export async function makePayment(request: Request, h: ResponseToolkit) {
    const userId = <string>request.auth.credentials.userId; //UserID from JWT token

    let { entity, reference, transactionValue, description } = <any>(
        request.payload
    );
    if (entity === undefined) {
        return h.response({ feedback: 'Missing entity property' }).code(400);
    }
    if (reference === undefined) {
        return h.response({ feedback: 'Missing reference property' }).code(400);
    }
    if (transactionValue === undefined) {
        return h
            .response({ feedback: 'Missing transactionValue property' })
            .code(400);
    }
    if (
        parseFloat(transactionValue) <= 0 ||
        isNaN(parseFloat(transactionValue))
    ) {
        return h.response({ feedback: 'Invalid transaction value' }).code(400);
    }

    transactionValue = setDecimalPlaces(transactionValue);
    if (parseFloat(transactionValue) <= 0) {
        return h.response({ feedback: 'Invalid amount' }).code(400);
    }

    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }

    const wallet = db.data.wallets.find((wallet) => wallet.userId === userId);
    if (!wallet) {
        return h.response({ feedback: 'Wallet not found' }).code(404);
    }
    wallet.funds = addValues(wallet.funds, -transactionValue);
    if (parseFloat(wallet.funds) < 0) {
        return h.response({ feedback: 'Not enough funds' }).code(401);
    }
    const payment = new Payment(
        entity,
        reference,
        '-' + transactionValue,
        wallet.funds,
        'Service payment processed' //TODO Use payload description
    );
    const movementList = db.data.movementLists.find(
        (list) => list.walletId === wallet.id
    );
    if (!movementList) {
        return h.response({ feedback: 'Movement list not found' }).code(404);
    }
    movementList.payments.unshift(payment);

    updateWallet(wallet);
    updateMovementList(movementList);

    await db.write(); //Required to write to database

    return h.response({ feedback: 'Payment processed', payment }).code(200);
}
/**
 * <p>Route | POST:payments</p>
 * <p>Processes new payment</p>
 * <p>User is identified using JWT token credentials</p>
 * <p>Payload required: entity (string), reference (string), transactionValue (string|number)</>
 * <p>Payload optional: description (string)
 *
  'feedback' property and, if successful, 'payment' property with the new payment
 **/

export async function subscribe(request: Request, h:ResponseToolkit) {
    const userId = <string>request.auth.credentials.userId; //UserID from JWT token
    const user =  db.data?.users.find((user) => user.id === userId);
    let {paymentInfo, subscribed } = <any> (request.payload);

      // Verifique se os dados de pagamento são válidos
      if (!paymentInfo.cardNumber || !paymentInfo.expirationDate || !paymentInfo.cvv) {
        return h.response({ feedback: 'Todos os detalhes de pagamento são obrigatórios' }).code(400);
    }
    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }
    const name = user?.name
    const email = user.email
    subscribed = new Subscribed(
        userId, 
        email, 
        paymentInfo,
        name
        );
            
       // Lógica para salvar o usuário inscrito no banco de dados
       try {
                if (user){ 
     (db.data.subscribes || []).unshift(subscribed);
     updateSubscriptionStatus(user)
    // Adiciona o usuário inscrito à lista de inscritos
            // Agora você pode usar user.name com segurança.
     console.log("usuarios:", subscribed)
     console.log(user.isSubscribed)
        await db.write(); //Required to write to database
                // Salvar 'subscribed' no banco de dados
                return h.response({ feedback: 'Inscrição realizada com sucesso' }).code(200);
                console.log("usuarios:", subscribed)
            }
        
        // ...
    } catch (error) {
        console.error(error);
        return h.response({ feedback: 'Ocorreu um erro ao processar a inscrição' }).code(500);
    }

}


    // Verifica o status de inscrição do usuário no banco de dados


    export async function checkSubscription (request: Request, h: ResponseToolkit) {
        const userId = <string>request.auth.credentials.userId; //UserID from JWT token
        const user = db.data?.users.find((user) => user.id === userId);
        await db.read(); //Required to get up-to-date database data

        try {
            if (!user) {
                return h.response({ feedback: 'Usuário não encontrado' }).code(403);
            } 
            if (user.isSubscribed == true)
                return h.response({ feedback: 'Usuario inscrito' }); {
            }
               
            } catch (error) {
                console.error(error);
                return h.response({ feedback: 'Ocorreu um erro ao atualizar o status de inscrição' }).code(500);
            }
        
        };

/**
 * <p>Route | POST:transfers</p>
 * <p>Processes new transfer</p>
 * <p>User is identified using JWT token credentials</p>
 * <p>Payload required: recipientWalletId (string), transactionValue (string|number)</>
 * <p>Payload optional: description (string)
 *
 * @returns 'feedback' property and, if successful, 'transfer' property with the new transfer
 */
export async function makeTransfer(request: Request, h: ResponseToolkit) {
    const userId = <string>request.auth.credentials.userId; //UserID from JWT token
    const user = db.data?.users.find((user) => user.id === userId);

    let { recipientWalletId, transactionValue, recipientData, type } = <any>(
        request.payload
    );




    if (!user || user.isSubscribed === false) {
        return h.response({ feedback: 'Usuário não está inscrito para transferências internacionais' }).code(403);
    }
             // Verifica se o usuário está inscrito para transferências internacionais
         
    if (type === 'international') 
     {
        if (type === undefined) {
            return h
                .response({ feedback: 'Missing recipientWalletId property' })
                .code(400);
        }

        if (recipientWalletId === undefined) {
            return h
                .response({ feedback: 'Missing recipientWalletId property' })
                .code(400);
        }
        if (transactionValue === undefined) {
            return h
                .response({ feedback: 'Missing transactionValue property' })
                .code(400);
        }


        const cost = transactionValue/15; // Custo fixo da transferência internacional
        const exchangeRate = 0.8; // Taxa de câmbio fictícia
        const totalCost = cost + transactionValue + exchangeRate; // Custo total da transação
       
        if (
            parseFloat(transactionValue) <= 0 ||
            isNaN(parseFloat(transactionValue))
        ) {
            return h.response({ feedback: 'Invalid transaction value' }).code(400);
        }
     
        transactionValue = setDecimalPlaces(transactionValue);
        if (parseFloat(transactionValue) <= 0) {
            return h.response({ feedback: 'Invalid amount' }).code(422);
        }
    
        await db.read(); //Required to get up-to-date database data
        if (!db.data) {
            return h.response({ feedback: 'Database error' }).code(500);
        }
    
        //Get wallet of the user that's making the transfer and updating it
        const originWallet = db.data.wallets.find(
            (wallet) => wallet.userId === userId
        );
        if (!originWallet) {
            return h.response({ feedback: 'Origin Wallet not found' }).code(404);
        }
        originWallet.funds = addValues(originWallet.funds, -totalCost);
        //Get wallet of the user that's getting the transfer and updating it
        const recipientWallet = db.data.wallets.find(
            (wallet) => wallet.id === recipientWalletId
        );
        if (!recipientWallet) {
            return h.response({ feedback: 'Recipient Wallet not found' }).code(404);
        }
        recipientWallet.funds = addValues(recipientWallet.funds, transactionValue);
        
        if (parseFloat(originWallet.funds) < 0) {
            return h.response({ feedback: 'Not enough funds' }).code(401);
}
        // Cria os objetos de Transferência para o remetente e o destinatário
        const originTransfer = new Transfer(
            originWallet.id,
            recipientWalletId,
            '-' + transactionValue,
            originWallet.funds,
            recipientData, 
            'international'
        );
        const recipientTransfer = new Transfer(
            originWallet.id,
            recipientWalletId,
            transactionValue,
            recipientWallet.funds,
            recipientData,
            'international'
                    );

        // Atualiza as listas de movimento do remetente e do destinatário
    const originMovementList = db.data.movementLists.find(
        (list) => list.walletId === originWallet.id
    );
    if (!originMovementList) {
        return h.response({ feedback: 'Movement list not found' }).code(404);
    }
    originMovementList.transfers.unshift(originTransfer);

    //Get movement list of the user that's getting the transfer
    const recipientMovementList = db.data.movementLists.find(
        (list) => list.walletId === recipientWallet.id
    );
    if (!recipientMovementList) {
        return h.response({ feedback: 'Movement list not found' }).code(404);
    }
    recipientMovementList.transfers.unshift(recipientTransfer);

    updateWallet(originWallet);
    updateWallet(recipientWallet);
    updateMovementList(originMovementList);
    updateMovementList(recipientMovementList);

    await db.write(); //Required to write to database
    return h
        .response({ feedback: 'Transfer processed', transfer: originTransfer })
        .code(200);

    }    

    else    

    {

        if (type === undefined) {
            return h
                .response({ feedback: 'Missing recipientWalletId property' })
                .code(400);
        }

    if (recipientWalletId === undefined) {
        return h
            .response({ feedback: 'Missing recipientWalletId property' })
            .code(400);
    }
    if (transactionValue === undefined) {
        return h
            .response({ feedback: 'Missing transactionValue property' })
            .code(400);
    }
    if (
        parseFloat(transactionValue) <= 0 ||
        isNaN(parseFloat(transactionValue))
    ) {
        return h.response({ feedback: 'Invalid transaction value' }).code(400);
    }
    transactionValue = setDecimalPlaces(transactionValue);
    if (parseFloat(transactionValue) <= 0) {
        return h.response({ feedback: 'Invalid amount' }).code(422);
    }

    await db.read(); //Required to get up-to-date database data
    if (!db.data) {
        return h.response({ feedback: 'Database error' }).code(500);
    }

    //Get wallet of the user that's making the transfer and updating it
    const originWallet = db.data.wallets.find(
        (wallet) => wallet.userId === userId
    );
    if (!originWallet) {
        return h.response({ feedback: 'Origin Wallet not found' }).code(404);
    }
    originWallet.funds = addValues(originWallet.funds, -transactionValue);
    //Get wallet of the user that's getting the transfer and updating it
    const recipientWallet = db.data.wallets.find(
        (wallet) => wallet.id === recipientWalletId
    );
    if (!recipientWallet) {
        return h.response({ feedback: 'Recipient Wallet not found' }).code(404);
    }
    recipientWallet.funds = addValues(recipientWallet.funds, transactionValue);
    if (parseFloat(originWallet.funds) < 0) {
        return h.response({ feedback: 'Not enough funds' }).code(401);
    }

    const originTransfer = new Transfer(
        originWallet.id,
        recipientWalletId,
        '-' + transactionValue,
        originWallet.funds,
        recipientData, 
        type
    );
    const recipientTransfer = new Transfer(
        originWallet.id,
        recipientWalletId,
        transactionValue,
        recipientWallet.funds,
        recipientData, 
        type
    );

    //Get movement list of the user that's making the transfer
    const originMovementList = db.data.movementLists.find(
        (list) => list.walletId === originWallet.id
    );
    if (!originMovementList) {
        return h.response({ feedback: 'Movement list not found' }).code(404);
    }
    originMovementList.transfers.unshift(originTransfer);

    //Get movement list of the user that's getting the transfer
    const recipientMovementList = db.data.movementLists.find(
        (list) => list.walletId === recipientWallet.id
    );
    if (!recipientMovementList) {
        return h.response({ feedback: 'Movement list not found' }).code(404);
    }
    recipientMovementList.transfers.unshift(recipientTransfer);

    updateWallet(originWallet);
    updateWallet(recipientWallet);
    updateMovementList(originMovementList);
    updateMovementList(recipientMovementList);

    await db.write(); //Required to write to database

    return h
        .response({ feedback: 'Transfer processed', transfer: originTransfer })
        .code(200);
}
}