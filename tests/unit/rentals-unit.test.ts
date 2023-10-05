import rentalsRepository from "../../src/repositories/rentals-repository";
import moviesRepository from "../../src/repositories/movies-repository";
import usersRepository from "../../src/repositories/users-repository";
import { RentalInput } from "../../src/protocols/index";
import rentalsService from "../../src/services/rentals-service";

describe("Rentals Service Unit Tests", () => {
  it("Should return movie not found", async () => {
    const userId: number = 1;
    jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
      return {
        id: userId
      }
    });

    jest.spyOn(rentalsRepository, "getRentalsByUserId").mockImplementationOnce((): any => {
      return [ ];
    });

    jest.spyOn(moviesRepository, "getById").mockImplementation((): any => {
      return false;
    });

    const rentalInput: RentalInput = {
      userId: 1,
      moviesId: [ 3, 1, 2, 25 ]
    };

    const resultData = {
      id: 1,
      userId,
      movies: rentalInput.moviesId,
    };
    
    jest.spyOn(rentalsRepository, "createRental").mockImplementationOnce((): any => {
      return resultData
    });
    
    const promise = rentalsService.createRental(rentalInput);
    expect(promise).rejects.toEqual({
      name: "NotFoundError",
      message: "Movie not found."
    });
  });

  it("Should return the rental when everything is ok", async () => {
    const userId: number = 1;
    jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
      return {
        id: userId
      }
    });

    jest.spyOn(rentalsRepository, "getRentalsByUserId").mockImplementationOnce((): any => {
      return [ ];
    });

    jest.spyOn(moviesRepository, "getById").mockImplementation((): any => {
      return {
        rentalId: null,
        adultsOnly: false
      };
    });

    const rentalInput: RentalInput = {
      userId: 1,
      moviesId: [ 3, 1, 2, 25 ]
    };

    const resultData = {
      id: 1,
      userId,
      movies: rentalInput.moviesId,
    };
    
    jest.spyOn(rentalsRepository, "createRental").mockImplementationOnce((): any => {
      return resultData
    });
    
    const result = await rentalsService.createRental(rentalInput);
    expect(result).toEqual(resultData);
  });

  it("Should return PAYMENT_REQUIRED when the user have a pendent rental(closed = false)", async () => {
    const userId: number = 1;
    jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
      return {
        id: userId
      }
    });

    jest.spyOn(rentalsRepository, "getRentalsByUserId").mockImplementationOnce((): any => {
      return [ 'pendent rental' ];
    });

    jest.spyOn(moviesRepository, "getById").mockImplementation((): any => {
      return {
        rentalId: null,
        adultsOnly: false
      };
    });

    const rentalInput: RentalInput = {
      userId: 1,
      moviesId: [ 1, 2, 3, 4 ]
    };

    const resultData = {
      id: 1,
      userId,
      movies: rentalInput.moviesId
    };
    
    jest.spyOn(rentalsRepository, "createRental").mockImplementationOnce((): any => {
      return resultData
    });
    
    const promise = rentalsService.createRental(rentalInput);
    expect(promise).rejects.toEqual({
      name: "PendentRentalError",
      message: "The user already have a rental!"
    });
  });

  it("Should return UNAUTHORIZED when the user cannot see the movie(age < 18 && adultsOnly === true)", async () => {
    const userId: number = 1;
    jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
      return {
        id: userId,
        birthDate: new Date(2018, 10, 10)
      }
    });

    jest.spyOn(rentalsRepository, "getRentalsByUserId").mockImplementationOnce((): any => {
      return [ ];
    });

    jest.spyOn(moviesRepository, "getById").mockImplementation((): any => {
      return {
        rentalId: null,
        adultsOnly: true
      };
    });

    const rentalInput: RentalInput = {
      userId: 1,
      moviesId: [ 1, 2, 3, 4 ]
    };

    const resultData = {
      id: 1,
      userId,
      movies: rentalInput.moviesId
    };
    
    jest.spyOn(rentalsRepository, "createRental").mockImplementationOnce((): any => {
      return resultData
    });
    
    const promise = rentalsService.createRental(rentalInput);
    expect(promise).rejects.toEqual({
      name: "InsufficientAgeError",
      message: "Cannot see that movie."
    });
  });

  it("Should return CONFLICT when the user when the movie isnt avaliable(rentalId !== null)", async () => {
    const userId: number = 1;
    jest.spyOn(usersRepository, "getById").mockImplementationOnce((): any => {
      return {
        id: userId
      }
    });

    jest.spyOn(rentalsRepository, "getRentalsByUserId").mockImplementationOnce((): any => {
      return [ ];
    });

    jest.spyOn(moviesRepository, "getById").mockImplementation((): any => {
      return {
        rentalId: 1,
        adultsOnly: false
      };
    });

    const rentalInput: RentalInput = {
      userId: 1,
      moviesId: [ 1, 2, 3, 4 ]
    };

    const resultData = {
      id: 1,
      userId,
      movies: rentalInput.moviesId
    };
    
    jest.spyOn(rentalsRepository, "createRental").mockImplementationOnce((): any => {
      return resultData
    });
    
    const promise = rentalsService.createRental(rentalInput);
    expect(promise).rejects.toEqual({
      name: "MovieInRentalError",
      message: "Movie already in a rental."
    });
  });
});