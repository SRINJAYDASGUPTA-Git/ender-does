namespace ender_does_backend_NET.Exceptions;

public class ApplicationException : Exception
{
    public int StatusCode { get; }

    public ApplicationException(
        string message,
        int statusCode)
        : base(message)
    {
        StatusCode = statusCode;
    }
}