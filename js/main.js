const fs = require('fs');

let nextShareCount = 500;
let ethPrice = 1800;

function getSharePrice(n) {
    const scalingFactor = 16000;
    return (n ** 2) / scalingFactor;
}

function getNetFees(sharePrice) {
    const protocolFee = 0.05;
    const hostFee = 0.05;
    return (sharePrice * protocolFee) + (sharePrice * hostFee);
}

function getBuyPrice(n) {
    return getSharePrice(n) + getNetFees(getSharePrice(n));
}

function findShareByPrice(data, sharePrice) {
    return data.find(item => item.sharePrice === sharePrice);
}

function getNByPrice(sharePrice) {
    const scalingFactor = 16000;
    return Math.sqrt(sharePrice * scalingFactor);
}

function getSellPrice(share) {
    if (share <= 1) {
        return 0;
    }
    return (getSharePrice(share-1) - getNetFees(share-1));
}

function getProfitableShare(data, share) {
    const currentBuyPrice = data[share].buyPrice;
    for (let i = share + 1; i < data.length; i++) {
        if (data[i].sellPrice >= currentBuyPrice) {
            return i;
        }
    }
    // error: no profitable shares found (likely due to insufficient data)
    return null;
}

function getSuffix(num) {
    const j = num % 10,
          k = num % 100;
    if (j == 1 && k != 11) {
        return 'st';
    }
    if (j == 2 && k != 12) {
        return 'nd';
    }
    if (j == 3 && k != 13) {
        return 'rd';
    }
    return 'th';
}

function generateData(shareCount) {
    const dataCollection = [{
        share: 0,
        sharePrice: 0,
        netFees: 0,
        buyPrice: 0,
        sellPrice: 0,
        profitableShare: 0,
        profitableShareDelta: 0,
    }];

    for (let i = 1; i < shareCount; i++) {
        const share = i;
        const sharePrice = getSharePrice(share);
        const netFees = getNetFees(sharePrice);
        const buyPrice = getBuyPrice(share);
        const sellPrice = getSellPrice(share);

        dataCollection.push({
            share,
            sharePrice,
            netFees,
            buyPrice,
            sellPrice,
            profitableShare: 0, // Temporary value, will update later
            profitableShareDelta: 0, // Temporary value, will update later
        });
    }

    // Update profitableShare and profitableShareDelta
    for (let i = 1; i < shareCount; i++) {
        let share = i;
        const profitableShare = getProfitableShare(dataCollection, share);
        dataCollection[share].profitableShare = profitableShare !== null ? profitableShare : 0;
        dataCollection[share].profitableShareDelta = profitableShare !== null ? (profitableShare - share) : 0;
    }

    return dataCollection;
}

function writeDataToFile(dataCollection, filePath) {
    fs.writeFile(filePath, JSON.stringify(dataCollection, null, 2), (err) => {
      if (err) {
        console.error('Error writing to file', err);
      } else {
        console.log('Data written successfully to', filePath);
      }
    });
}

const data = generateData(nextShareCount);
writeDataToFile(data, './../data_buy.json');