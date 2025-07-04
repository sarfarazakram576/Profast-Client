import React from "react";
import { useQuery } from "@tanstack/react-query";
import { IoMdEye } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router";
import useAuth from "../../../Hooks/useAuth";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import Loading from "../../../Components/Loading/Loading";

const MyParcels = () => {
  const axiosSecure = useAxiosSecure();
  const { userEmail, uid } = useAuth();
  const navigate = useNavigate();

  const {
    isPending,
    data: parcels,
    refetch,
  } = useQuery({
    queryKey: ["my-parcels", userEmail],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/parcels?email=${userEmail}&uid=${uid}`
      );
      return res.data;
    },
  });

  const handlePay = (id) => {
    navigate(`/dashboard/payment/${id}`);
  };

  if (isPending) {
    return (
      <Loading></Loading>
    );
  }

  const handleAssignmentDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .delete(`/parcels/${id}?uid=${uid}`)
          .then((res) => {
            if (res.data.deletedCount) {
              toast.success("Your sended parcel is deleted.");
              refetch();
            }
          })
          .catch((error) => toast.error(error.message));
      }
    });
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleString();
  };

  const hasAssignedRider = parcels.some((parcel) => parcel.assigned_rider_name);

  return (
    <div className="px-4">
      {parcels.length === 0 ? (
        <div className="text-center">
          <h1 className="text-3xl text-gray-600 font-extrabold">
            No Parcels yet.
          </h1>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl text-gray-600 font-extrabold mb-6 text-center">
            Your sended parcels
          </h1>
          <div className="overflow-x-auto rounded-box border-2 border-base-content/5 bg-base-200 items-center">
            <table className="table text-center table-xs">
              {/* head */}
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Traking Id</th>
                  <th>Type</th>
                  <th>Created At</th>
                  <th>Cost</th>
                  <th>Payment Status</th>
                  {hasAssignedRider && <th>Assigned Rider Name</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((parcel, index) => (
                  <tr key={parcel._id}>
                    <th>{index + 1}</th>
                    <td className="max-w-[180px] truncate">{parcel.title}</td>
                    <td>{parcel.tracking_id}</td>
                    <td>{parcel.type}</td>
                    <td>{formatDate(parcel.creation_date)}</td>
                    <td>{parcel.cost}</td>
                    <td>
                      {
                        <div
                          className={`badge ${
                            parcel.payment_status === "paid"
                              ? "badge-success"
                              : "badge-error"
                          }  rounded-full text-xs font-bold h-auto`}
                        >
                          {parcel.payment_status}
                        </div>
                      }
                    </td>

                    {hasAssignedRider && (
                      <td>
                        {parcel.assigned_rider_name
                          ? parcel.assigned_rider_name
                          : "Not Assigned yet"}
                      </td>
                    )}

                    <td className="flex gap-1 justify-end">
                      {parcel.payment_status === "unpaid" && (
                        <button
                          onClick={() => handlePay(parcel._id)}
                          className="btn-primary btn-sm font-bold btn rounded-sm px-1.5 block text-black"
                        >
                          Pay
                        </button>
                      )}{" "}
                      <button className="bg-[#b18a56] btn-sm btn text-lg rounded-sm px-2 block text-white">
                        <IoMdEye size={15} />
                      </button>
                      <button
                        onClick={() => handleAssignmentDelete(parcel._id)}
                        className="bg-[#EA4744] btn-sm btn text-lg rounded-sm px-2 block text-white"
                      >
                        <MdDelete size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyParcels;
