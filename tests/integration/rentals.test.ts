import app from "app";
import supertest from "supertest";
import { cleanDb } from "../utils";
import { GetResult } from "@prisma/client/runtime/library";
import { boolean } from "joi";
import { buildFilm, buildRental, buildUser } from "../factories/rentals.factory";
import { RentalFinishInput, RentalInput } from "protocols";
import httpStatus from "http-status";
import { createRental } from "controllers/rentals-controller";
const server = supertest(app);

describe("Rentals Endpoint", () => {
 
  beforeEach( async () => {
    await cleanDb();
  });

  it("GET /rentals. Should respond with a rental array", async () => {

      const user = await buildUser();
      await buildRental(user.id);
      const response = await server.get("/rentals");
      
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({
            id: expect.any(Number),
            date: expect.any(String),
            endDate: expect.any(String),
            userId: expect.any(Number),
            closed: expect.any(Boolean),
        })
      ]));
  })

  it("GET /rentals/:id. Should respond with a rental", async () => {
   
      const user = await buildUser();
      const rental = await buildRental(user.id);
      const response = await server.get("/rentals/" + rental.id.toString());
      
      expect(response.body).toEqual(
        expect.objectContaining({
            id: expect.any(Number),
            date: expect.any(String),
            endDate: expect.any(String),
            userId: expect.any(Number),
            closed: expect.any(Boolean),
        })
      );
  })
  
  test("POST /rentals. Should return with status CREATED if send correct data", async () => {
      const user = await buildUser();
      const movie = await buildFilm();
      const movie2 = await buildFilm();
      const movie3 = await buildFilm();
      
      const payload: RentalInput = {
        userId: user.id,
        moviesId: [movie.id, movie2.id, movie3.id]
      }

      const response = await server.post("/rentals").send(payload); 
      
      expect(response.statusCode).toBe(httpStatus.CREATED);

  })

  test("POST /rentals. Should return with status UNAUTHORIZED if send data with insufficient age and age restricted movies", async () => {
      const user = await buildUser(new Date());
      const movie = await buildFilm(null, true);
      const movie2 = await buildFilm(null, true);
      const movie3 = await buildFilm(null, true);
      
      const payload: RentalInput = {
        userId: user.id,
        moviesId: [movie.id, movie2.id, movie3.id]
      }

      const response = await server.post("/rentals").send(payload); 
      
      expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
    
  })

  test("POST /rentals. Should return with status CONFLICT if one of the movies is already rented", async () => {
      const user = await buildUser();
      const movie = await buildFilm(null, true);
      
      const payload: RentalInput = {
        userId: user.id,
        moviesId: [movie.id]
      }
      await server.post("/rentals").send(payload); 

      const user2 = await buildUser();
      const payload2: RentalInput = {
        userId: user2.id,
        moviesId: [movie.id]
      }
      const response2 = await server.post("/rentals").send(payload2); 
      
      expect(response2.statusCode).toBe(httpStatus.CONFLICT);
  })

  test("POST /rentals. Should return with status PAYMENT_REQUIRED if user already have an rental", async () => {
      const user = await buildUser();
      const movie = await buildFilm(null, true);
      const movie2 = await buildFilm(null, true);
      
      const payload: RentalInput = {
        userId: user.id,
        moviesId: [movie.id]
      }
      await server.post("/rentals").send(payload); 
     
      payload.moviesId.push(movie2.id);
      const response2 = await server.post("/rentals").send(payload); 
      
      expect(response2.statusCode).toBe(httpStatus.PAYMENT_REQUIRED);
  })

  test("POST /rentals. Should return error if does not select a movie", async () => {
      const user = await buildUser();
      
      const payload: RentalInput = {
        userId: user.id,
        moviesId: []
      }
      const response = await server.post("/rentals").send(payload); 
     
      expect(response.statusCode).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  })

  test("POST /rentals. Should return error if select movie more than 4 movies", async () => {
      const user   = await buildUser();
      const movie  = await buildFilm(null, true);
      const movie2 = await buildFilm(null, true);
      const movie3 = await buildFilm(null, true);
      const movie4 = await buildFilm(null, true);
      const movie5 = await buildFilm(null, true);

      const payload: RentalInput = {
        userId: user.id,
        moviesId: [movie.id, movie2.id, movie3.id, movie4.id, movie5.id]
      }

      const response = await server.post("/rentals").send(payload); 
     
      expect(response.statusCode).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  })

  test("POST /rentals/finish. Should return with OK if send correct data", async () => {
    const user = await buildUser();
    const rental = await buildRental(user.id) 

    const payload: RentalFinishInput = {
      rentalId: rental.id,
    }
   
    const response = await server.post("/rentals/finish").send(payload); 
    expect(response.statusCode).toBe(httpStatus.OK);
  })
})