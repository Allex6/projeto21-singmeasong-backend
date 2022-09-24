import { insertManyRecommendations, downvoteRecommendations, upvoteRecommendations } from '../__tests__/factories/recommendationFactory';
import { prisma } from './../src/database';

async function main(){

    await insertManyRecommendations();
    await upvoteRecommendations();
    await downvoteRecommendations();

}

(async () => {

    try {
    
        await main();
        await prisma.$disconnect();
        console.log('Seed completed!');
        process.exit(0);

    } catch (err) {
        console.log(err);
        await prisma.$disconnect();
        process.exit(1);
    }

})();