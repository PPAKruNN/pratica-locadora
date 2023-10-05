import prisma from "database";
import { faker } from "@faker-js/faker";
import { generateCPF } from '@brazilian-utils/brazilian-utils';

export async function buildUser(birthDate: Date = maiorityGen() ){
  return await prisma.user.create({
    data: {
      birthDate,
      cpf: generateCPF(), 
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName()
    }
  });
};

export async function buildFilm(rentalId: number = null, adultsOnly?: boolean){
  return await prisma.movie.create({
    data: {
      adultsOnly: adultsOnly ?? faker.datatype.boolean(),
      name: faker.commerce.productName(),
      rentalId
    }
  });
};

export async function buildRental(userId: number){
  return await prisma.rental.create({
    data: {
      endDate: faker.date.future(),
      userId
    }
  });
};

function maiorityGen() {
  let eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear()-19);
  return eighteenYearsAgo;
}